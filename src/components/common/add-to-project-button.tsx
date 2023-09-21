import styles from "@/styles/Inbox.module.css";
import {
    Button,
    Menu,
    MenuButton,
    MenuItem,
    MenuList,
    Input,
    InputGroup,
    InputLeftElement
} from "@chakra-ui/react";
import {SearchIcon, SmallAddIcon} from "@chakra-ui/icons";
import {FolderIcon} from "@/icons";
import React, {useCallback, useEffect, useRef, useState} from "react";
import {Project} from "@/models";
import {addItemToGroup, updateMembershipState} from "@/redux/memberships/action-reducer";
import {useDispatch, useSelector} from "react-redux";
import {StateType} from "@/types";
import {Toaster} from "@/components/common/toaster";
import {updateCommonState} from "@/redux/common-apis/action-reducer";

export function AddToProjectButton() {
    const [isDropdownOpen, setDropDownOpen] = useState(false)
    const [isWindowActive, setWindowActive] = useState<boolean>(true);
    const dispatch = useDispatch();
    const {selectedThread, multiSelection} = useSelector((state: StateType) => state.threads);

    let {projects} = useSelector((state: StateType) => state.projects);
    const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
    const [searchValue, setSearchValue] = useState<string>('');

    const addToProjectRef = useRef<HTMLInputElement | null>(null);
    const searchRef = useRef<HTMLInputElement | null>(null);
    const {isThreadAddedToProjectSuccess} = useSelector((state: StateType) => state.memberships);
    const [successMessage, setSuccessMessage] = useState<{ desc: string, title: string } | null>(null);

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
        if (isThreadAddedToProjectSuccess && successMessage) {
            Toaster({
                desc: successMessage.desc,
                title: successMessage.title || '',
                type: 'success'
            });
            dispatch(updateMembershipState({isThreadAddedToProjectSuccess: false}))
        }
    }, [dispatch, isThreadAddedToProjectSuccess, successMessage])

    useEffect(() => {
        setFilteredProjects((projects || []));
    }, [projects])

    const addThreadToProject = useCallback((item: Project) => {
        const isThreadMultiSelection = (multiSelection !== undefined && multiSelection.length > 0)

        if ((selectedThread && selectedThread.id || (multiSelection !== undefined && multiSelection.length > 0))) {
            let reqBody = {
                threadIds: isThreadMultiSelection ? multiSelection : [selectedThread!.id],
                roles: [
                    'n/a',
                ],
                groupType: 'project',
                groupId: item.id
            }

            if (isThreadMultiSelection) {
                setSuccessMessage({
                    title: `${multiSelection.length} threads added to ${item.name?.toLowerCase()}`,
                    desc: ''
                })
            } else {
                setSuccessMessage({
                    desc: 'Thread was added to ' + item.name?.toLowerCase() + '.',
                    title: selectedThread?.subject || '',
                })
            }
            dispatch(addItemToGroup(reqBody));
            if (addToProjectRef.current) {
                addToProjectRef.current?.click();
            }
        }
    }, [dispatch, selectedThread, multiSelection]);

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
            addThreadToProject(filteredProjects[0]);
        }
    }

    /**
     * Detects if the iframe was clicked
     */
    const onWindowBlur = useCallback(() => {
        const message = document.activeElement;
        setTimeout(() => {
            if (document.activeElement && document?.activeElement.tagName === 'IFRAME' && message) {
                message.textContent = 'clicked ' + Date.now();
                setDropDownOpen(false);
                setWindowActive(false);
            }
        });
    }, []);

    useEffect(() => {
        window.addEventListener('blur', onWindowBlur);
        return () => {
            window.removeEventListener('blur', onWindowBlur);
        };
    }, [isWindowActive, onWindowBlur]);

    return (
        <>
            <Menu
                isOpen={isDropdownOpen}
                onClose={() => {
                    setDropDownOpen(false)
                    setSearchValue('')
                }}
                closeOnBlur={true}>
                <MenuButton
                    onClick={() => setDropDownOpen(!isDropdownOpen)}
                    className={styles.addToProject}
                    leftIcon={<FolderIcon/>}
                    borderRadius={'50px'}
                    backgroundColor={'#2A6FFF'}
                    color={'#FFFFFF'}
                    as={Button}
                    boxShadow={'0 0 3px 0 rgba(38, 109, 240, 0.12)'}
                    padding={'4px 4px 4px 8px'}
                    fontSize={'12px'} fontWeight={500}
                    h={'fit-content'}
                    ref={addToProjectRef}
                >
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

                    {filteredProjects && !!filteredProjects.length && (filteredProjects || []).map((item: Project, index: number) => (
                        <MenuItem gap={2} key={index} onClick={() => addThreadToProject(item)}>
                            {item.emoji} {item.name}
                        </MenuItem>

                    ))}

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
