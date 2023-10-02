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
    Box,
} from "@chakra-ui/react";
import {SearchIcon, SmallAddIcon} from "@chakra-ui/icons";
import {FolderIcon} from "@/icons";
import React, { useEffect, useRef, useState} from "react";
import {Project} from "@/models";
import {useDispatch, useSelector} from "react-redux";
import {StateType} from "@/types";
import {updateCommonState} from "@/redux/common-apis/action-reducer";
import {addThreadToProject} from "@/utils/threads-common-functions";

export function AddToProjectButton() {
    const [isDropdownOpen, setDropDownOpen] = useState(false)
    const dispatch = useDispatch();
    const {selectedThread, multiSelection} = useSelector((state: StateType) => state.threads);

    let {projects} = useSelector((state: StateType) => state.projects);
    const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
    const [searchValue, setSearchValue] = useState<string>('');

    const addToProjectRef = useRef<HTMLInputElement | null>(null);
    const searchRef = useRef<HTMLInputElement | null>(null);
    const {event: incomingEvent} = useSelector((state: StateType) => state.globalEvents);
    const { draft } = useSelector((state: StateType) => state.draft);

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

    // useEffect(() => {
    //     if (isThreadAddedToProjectSuccess && successMessage) {
    //         Toaster({
    //             desc: successMessage.desc,
    //             title: successMessage.title || '',
    //             type: 'success'
    //         });
    //         dispatch(updateMembershipState({isThreadAddedToProjectSuccess: false}))
    //     }
    // }, [dispatch, isThreadAddedToProjectSuccess, successMessage])

    useEffect(() => {
        setFilteredProjects((projects || []));
    }, [projects])

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
        if (e.key.toLowerCase() === 'enter' && filteredProjects.length === 1 && selectedThread) {
            addThreadToProject(filteredProjects[0], multiSelection, selectedThread || draft, dispatch, addToProjectRef);
        }
    }

    useEffect(() => {
        if (incomingEvent === 'iframe.clicked') {
            setDropDownOpen(false);
        }
    }, [incomingEvent, setDropDownOpen]);

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
                <MenuButton
                    onClick={() => {
                      setDropDownOpen(!isDropdownOpen)
                      focusSearch();
                    }}
                    cursor={'pointer'}
                    className={styles.addToProject}
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
                    <span style={{ marginRight: 4 }}><FolderIcon/></span>
                    Add to Project
                    <span className={styles.RightContent}>⌘P</span>
                </MenuButton>
                <MenuList className={`${styles.addToProjectList} drop-down-list`} zIndex={'overlay'}>

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
                        {filteredProjects && !!filteredProjects.length && (filteredProjects || []).map((item: Project, index: number) => (
                            <MenuItem gap={2} key={index} onClick={() => {
                                if (selectedThread || draft) {
                                    addThreadToProject(item, multiSelection, selectedThread || draft, dispatch)
                                }
                            }}>
                                {item.emoji} {item.name}
                            </MenuItem>
                        ))}
                    </div>

                    <div className={styles.addNewProject}>
                        <Button backgroundColor={'transparent'} w={'100%'} borderRadius={0}
                                justifyContent={'flex-start'} onClick={() => dispatch(updateCommonState({
                            showCreateProjectModal: true,
                            shouldRedirectOnCreateProject: false
                        }))}>
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
