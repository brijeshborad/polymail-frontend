import styles from "@/styles/Inbox.module.css";
import {
    Button,
    Menu,
    MenuButton,
    MenuItem,
    MenuList,
    Input,
    InputGroup,
    InputLeftElement,
    Box, Flex, Text
} from "@chakra-ui/react";
import {CloseIcon, SearchIcon, SmallAddIcon} from "@chakra-ui/icons";
import {FolderIcon, MenuIcon} from "@/icons";
import React, {useEffect, useRef, useState} from "react";
import {Project} from "@/models";
import {useSelector} from "react-redux";
import {StateType} from "@/types";
import Router, {useRouter} from 'next/router';
import {commonService, globalEventService, threadService} from "@/services";

export function AddToProjectButton() {
    const [isDropdownOpen, setDropDownOpen] = useState(false)
    const {selectedThread, threads} = useSelector((state: StateType) => state.threads);
    let {projects, project} = useSelector((state: StateType) => state.projects);
    const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
    const [threadProject, setThreadProject] = useState<Project[]>([]);
    const [searchValue, setSearchValue] = useState<string>('');

    const addToProjectRef = useRef<HTMLInputElement | null>(null);
    const searchRef = useRef<HTMLInputElement | null>(null);
    const {event: incomingEvent} = useSelector((state: StateType) => state.globalEvents);
    const {composeDraft} = useSelector((state: StateType) => state.draft);
    const router = useRouter();
    const {isComposing} = useSelector((state: StateType) => state.commonApis);

    useEffect(() => {
        const handleShortcutKeyPress = (e: KeyboardEvent | any) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'p') {
                e.preventDefault();
                if (addToProjectRef.current) {
                    addToProjectRef.current?.click();
                    focusSearch();
                }
            }
        };
        window.addEventListener('keydown', handleShortcutKeyPress);
        return () => {
            window.removeEventListener('keydown', handleShortcutKeyPress);
        };
    }, []);


    useEffect(() => {
        let selectedProjects = selectedThread?.projects || [];
        if (isComposing) {
            selectedProjects = composeDraft?.projects || [];
        }
        if (selectedProjects.length) {
            setThreadProject(selectedProjects || [])
        } else {
            if (project) {
                setThreadProject([project])
            } else {
                setThreadProject([])
            }
        }
    }, [composeDraft, isComposing, project, selectedThread])

    useEffect(() => {
        setFilteredProjects((projects || []));
    }, [projects, selectedThread])

    useEffect(() => {
        if (searchValue.length > 0) {
            setFilteredProjects((projects || []).filter((item: Project) => item.name?.toLowerCase().includes(searchValue.toLowerCase())));
        } else {
            setFilteredProjects((projects || []));
        }
    }, [searchValue, projects])

    function focusSearch() {
        setTimeout(() => {
            if (searchRef.current) {
                searchRef.current?.focus();
            }
        }, 300)
    }

    function checkProjects(e: MouseEvent | any) {
        if (e.key.toLowerCase() === 'enter' && filteredProjects.length === 1) {
            setThreadProject(prevState => [...prevState, filteredProjects[0]]);
            threadService.addThreadToProject(filteredProjects[0], addToProjectRef, isComposing);
            setFilteredProjects((filteredProjects || []).filter((project: Project) => project.id !== filteredProjects[0].id));
        }
    }

    useEffect(() => {
        if (incomingEvent === 'iframe.clicked') {
            setDropDownOpen(false);
            globalEventService.fireEvent('');
        }
        if (typeof incomingEvent === 'object' && incomingEvent.type && incomingEvent.type === 'addToProject.remove') {
            let removeProject = threadProject.filter((project: any) => project.id !== incomingEvent.data.id);
            setThreadProject([...removeProject]);
            let projects = [...filteredProjects];
            projects.push(incomingEvent.data);
            setFilteredProjects([...projects]);
            globalEventService.fireEvent('');
        }
        if (typeof incomingEvent === 'object' && incomingEvent.type === 'addToProject.add') {
            setThreadProject(prevState => [...prevState, incomingEvent.data]);
            setFilteredProjects((filteredProjects || []).filter((project: Project) => project.id !== incomingEvent.data.id));
            globalEventService.fireEvent('');
        }
    }, [filteredProjects, incomingEvent, setDropDownOpen, threadProject]);

    const removeProjectFromThread = (item: Project) => {
        let finalThread = isComposing ? composeDraft : selectedThread;
        if (finalThread && finalThread.id) {
            let isOnProjectView: boolean = !!(router.query.project && router.query.project === item.id);
            let removeProject = threadProject.filter((project: any) => project.id !== item.id);
            setThreadProject([...removeProject]);
            threadService.removeThreadFromProject(item, isOnProjectView)
            if (!isComposing) {
                if (!(isOnProjectView && threads)) {
                    let projects = [...filteredProjects];
                    projects.push(item);
                    setFilteredProjects([...projects]);
                }
            }
        } else {
            let removeProject = threadProject.filter((project: any) => project.id !== item.id);
            setThreadProject(removeProject)
        }
        setDropDownOpen(false)
    }

    const addProjectToThread = (item: Project) => {
        if (selectedThread || composeDraft) {
            setThreadProject(prevState => [...prevState, item]);
            threadService.addThreadToProject(item, null, isComposing);
            setFilteredProjects((filteredProjects || []).filter((project: Project) => project.id !== item.id));
        }
    }

    return (
        <>
            <Menu
                isOpen={isDropdownOpen}
                onClose={() => {
                    setDropDownOpen(false)
                    setSearchValue('')
                    window.focus()
                }}
                closeOnBlur={true}
            >
                {threadProject?.length ? <MenuButton onClick={() => {
                    setDropDownOpen(!isDropdownOpen)
                    focusSearch();
                }}
                                                     cursor={'pointer'} className={`${styles.projectAdded}`}
                                                     borderRadius={'8px'}
                                                     backgroundColor={'#FFFFFF'} color={'#0A101D'} as={Box}
                                                     padding={'4px 4px'}
                                                     fontSize={'13px'} fontWeight={500} h={'fit-content'}
                                                     ref={addToProjectRef}>
                    <Flex alignItems={'center'} justify={'center'} mr={1} className={styles.projectSelectImage}>
                        {(threadProject || []).slice(0, 5).map((item: any, index: number) => (
                            <span className={styles.projectCount} key={index}> {item.emoji} </span>
                        ))}
                        {((threadProject || []).length > 5) && (
                            <span className={styles.projectsLength}>{`+${threadProject?.length - 5}`}</span>
                        )}
                    </Flex>
                    <div className={styles.projectAddedText}>
                        {threadProject?.length === 1 ? threadProject[0]?.name : threadProject?.length + ' ' + 'Projects'}
                    </div>
                    <Flex width={'20px'} height={'20px'} alignItems={'center'} justifyContent={'center'}
                          className={styles.projectMenuIcon}><MenuIcon/></Flex>
                </MenuButton> : <MenuButton
                    onClick={() => {
                        setDropDownOpen(!isDropdownOpen)
                        focusSearch();
                    }}
                    cursor={'pointer'}
                    className={`${styles.addToProject} ${styles.projectAdded}`}
                    borderRadius={'50px'}
                    backgroundColor={'#2A6FFF'}
                    color={'#FFFFFF'}
                    as={Box}
                    boxShadow={'0 0 3px 0 rgba(38, 109, 240, 0.12)'}
                    padding={'4px 4px 4px 8px'}
                    fontSize={'12px'} fontWeight={500}
                    h={'fit-content'}
                    ref={addToProjectRef}
                >
                    <span style={{marginRight: 4}}><FolderIcon/></span>
                    Add to Project
                    <span className={styles.RightContent}>⌘P</span>
                </MenuButton>}


                <MenuList className={`${styles.addToProjectList} drop-down-list`} zIndex={'overlay'}>
                    {!!threadProject?.length &&
                    <Flex direction={'column'} position={'relative'} pb={1} className={styles.selectedProject}>
                        {(threadProject || []).map((item: any, index: number) => (
                            <Flex alignItems={'center'} justifyContent={'space-between'} padding={'8px 12px'}
                                  key={index} className={styles.selectedProjectName}>
                                <Text color={'#374151'} fontSize={'13px'} fontWeight={'500'} width={'100%'}
                                      lineHeight={1} onClick={() => Router.push(`/projects/${item.id!}`)}
                                      letterSpacing={'-0.13px'}>{item.emoji} {item.name}</Text>
                                <Button
                                    onClick={() => removeProjectFromThread(item)}
                                    h={'20px'} minW={'20px'}
                                    className={styles.dropDownCloseIcon}
                                    backgroundColor={'transparent'} padding={0}
                                    color={'#6B7280'} colorScheme='blue'>
                                    <CloseIcon/>
                                </Button>
                            </Flex>
                        ))}
                    </Flex>
                    }

                    <div className={'dropdown-searchbar'}>
                        <InputGroup>
                            <InputLeftElement h={'27px'} pointerEvents='none'>
                                <SearchIcon/>
                            </InputLeftElement>
                            <Input ref={searchRef} autoFocus value={searchValue} onKeyDown={(e) => checkProjects(e)}
                                   onChange={(e) => setSearchValue(e.target.value)}
                                   placeholder='Search project'/>
                        </InputGroup>
                    </div>

                    <div className={'add-to-project-list'}>
                        {filteredProjects && !!filteredProjects.length && (filteredProjects || []).map((item: Project, index: number) => {
                            if (threadProject && threadProject.map(t => t.id).includes(item.id)) {
                                return null;
                            }
                            return (
                                <MenuItem gap={2} key={index} onClick={() => addProjectToThread(item)}>
                                    {item.emoji} {item.name}
                                </MenuItem>
                            )
                        })}
                    </div>

                    <div className={styles.addNewProject}>
                        <Button backgroundColor={'transparent'} w={'100%'} borderRadius={0}
                                justifyContent={'flex-start'}
                                onClick={() => commonService.toggleCreateProjectModel(true, false)}>
                            <div className={styles.plusIcon}>
                                <SmallAddIcon/>
                            </div>
                            Create New Project
                        </Button>
                    </div>
                </MenuList>
            </Menu>
        </>
    )
}
