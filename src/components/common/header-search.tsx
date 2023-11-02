import styles from "@/styles/Home.module.css";
import {
    Badge,
    Button,
    Flex,
    Input,
    InputGroup,
    InputRightElement, Text
} from "@chakra-ui/react";
import {CloseIcon, SearchIcon} from "@chakra-ui/icons";
import {FolderIcon, UserIcon} from "@/icons";
import React, {useEffect, useRef, useState} from "react";
import {getAllThreads} from "@/redux/threads/action-reducer";
import {useDispatch, useSelector} from "react-redux";
import {StateType} from "@/types";
import Router, {useRouter} from "next/router";
import {keyNavigationService, projectService, socketService, threadService} from "@/services";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import {Contacts, Project} from "@/models";

dayjs.extend(customParseFormat)

export function HeaderSearch() {
    const dispatch = useDispatch();
    const {tabValue, isThreadSearched} = useSelector((state: StateType) => state.threads);
    const {userDetails} = useSelector((state: StateType) => state.users);
    const {project, projects} = useSelector((state: StateType) => state.projects);
    const [showCloseIcon, setShowCloseIcon] = useState(false);
    const [searchString, setSearchString] = useState<string>('');
    const searchInputRef = useRef<HTMLInputElement | null>(null);
    const {selectedAccount} = useSelector((state: StateType) => state.accounts);
    const [badges, setBadges] = useState<string[]>([]);
    const [isProjectRoute, setIsProjectRoute] = useState<boolean>(false);
    const [filteredProjectsAndPeoples, setFilteredProjectsAndPeoples] = useState<any>([]);
    const [filteredPeoples, setFilteredPeoples] = useState<any>([]);
    const [peopleArray, setPeopleArray] = useState<any>(null);

    const router = useRouter();

    // keyboard shortcuts
    useEffect(() => {
        const handleShortcutKeyPress = (e: KeyboardEvent | any) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                if (searchInputRef.current) {
                    searchInputRef.current?.focus();
                }
            }
        };
        window.addEventListener('keydown', handleShortcutKeyPress);
        return () => {
            window.removeEventListener('keydown', handleShortcutKeyPress);
        };
    }, []);

    useEffect(() => {
        if (!isThreadSearched) {
            setSearchString('');
        }
    }, [isThreadSearched]);

    useEffect(() => {
        if (router.pathname.includes('/projects')) {
            let currentBadges = ['Projects'];
            setIsProjectRoute(true);
            if (router.query.project && project) {
                currentBadges = [`Project: ${project.name || ''}`];
            }
            setBadges(currentBadges);
        } else {
            setIsProjectRoute(false);
            setBadges([]);
        }
    }, [router.pathname, router.query, project]);

    useEffect(() => {
        if (isProjectRoute) {
            projectService.setProjectSearchString(searchString);
        }
    }, [searchString, isProjectRoute])

    const searchCancel = (callAPI: boolean = false) => {
        if (isProjectRoute && !project) {
            if (callAPI) {
                setPeopleArray(null);
                setSearchString('');
                projectService.setProjectSearchString('');
            }
            return;
        }
        socketService.cancelThreadSearch(userDetails?.id);
        setShowCloseIcon(false);
        if (selectedAccount && selectedAccount.id && callAPI) {
            setPeopleArray(null);
            if (searchString) {
                threadService.cancelThreadSearch(true);
            }
            setSearchString('');
            dispatch(getAllThreads({
                body: {
                    mailbox: tabValue,
                    ...(isProjectRoute && project ? {project: project.id} : {account: selectedAccount.id}),
                    pagination: {
                        cutoff: dayjs().add(5, "day").format('YYYY-MM-DD'),
                        count: 100,
                        page: 1
                    }
                }
            }));
        }
    }

    const handleKeyPress = (event: KeyboardEvent | any) => {
        if (event.key.toLowerCase() === 'enter') {
            searchCancel(false);
            if (searchString) {
                let finalSearchString = searchString;
                if (isProjectRoute && project) {
                    finalSearchString = `project:${project.id} ${searchString}`;
                }
                if (peopleArray) {
                    if (peopleArray.email.name) {
                        finalSearchString = `${peopleArray.email.name} ${searchString}`;
                    } else {
                        finalSearchString = `${peopleArray.email.email} ${searchString}`;
                    }
                }
                threadService.searchThread();
                socketService.searchThreads(userDetails?.id, finalSearchString);
                return;
            }
        }
    };

    const handleFocus = () => {
        keyNavigationService.toggleKeyNavigation(false);
        setShowCloseIcon(true);
    }

    const handleBlur = () => {
        keyNavigationService.toggleKeyNavigation(true);
        setTimeout(() => {
            // setShowCloseIcon(false);
        }, 300)
    };

    useEffect(() => {
        if (!searchString) {
            setFilteredPeoples([])
            setFilteredProjectsAndPeoples([])
        } else {
            setFilteredProjectsAndPeoples((projects || []).filter((item: Project) => item.name?.toLowerCase().includes(searchString.toLowerCase())));
            setFilteredPeoples((selectedAccount?.contacts || []).filter((item: Contacts) => (item.email.name || item.email.email)?.toLowerCase().includes(searchString.toLowerCase())));
        }
    }, [projects, searchString, selectedAccount?.contacts])

    useEffect(() => {
        const clickBox = document.getElementById('clickBox');
        document.addEventListener('click', function (e) {
            e.preventDefault();
            if (clickBox && e.target && clickBox.contains(e.target as Node)) {
                setShowCloseIcon(true);
            } else {
                setTimeout(() => {
                    setShowCloseIcon(false);
                }, 300)
            }
        });
    }, [])

    return (
        <div id="clickBox"
             className={`${styles.headerSearch} ${showCloseIcon && !isProjectRoute ? styles.headerSearchPopup : ''}`}
             onFocus={() => handleFocus()}
             onBlur={() => handleBlur()}>
            <InputGroup className={styles.inputGroup}>
                <Flex className={styles.headerSearchInput}>
                    <SearchIcon/>
                    {badges.map((badge: string, index: number) => (
                        <Badge key={index} textTransform={'none'} backgroundColor={'#ffffff'} color={'#08162F'}
                               borderRadius={'4px'}
                               fontSize={'12px'} fontWeight={'500'} padding={'4px 10px'} lineHeight={1}>{badge}</Badge>
                    ))}
                    <Flex className={styles.headerSearchChip} alignItems={'center'} wrap={'wrap'} gap={1}>
                        {peopleArray &&
                        <Badge textTransform={'none'} backgroundColor={'#ffffff'} color={'#08162F'}
                               borderRadius={'4px'} display={'flex'} alignItems={'center'}
                               fontSize={'12px'} fontWeight={'500'} padding={'4px 10px'} lineHeight={1}>
                            {peopleArray.email.name || peopleArray.email.email}
                            <CloseIcon cursor={'pointer'} width={'8px'} height={'8px'} marginLeft={'5px'}
                                       onClick={(e) => {
                                           e.preventDefault()
                                           e.stopPropagation();
                                           setPeopleArray(null)
                                       }}
                            />
                        </Badge>
                        }
                    </Flex>
                    <Input
                        flex={'1'}
                        type="text"
                        placeholder={isProjectRoute ? (project ? `Search in ${project.name}` : 'Search projects') : 'Search'}
                        onChange={event => {
                            setSearchString(event.target.value);
                        }}
                        ref={searchInputRef}
                        value={searchString}
                        onKeyPress={e => handleKeyPress(e)}
                    />
                    <InputRightElement>
                        {showCloseIcon ? <div className={styles.inputRight} style={{background: "transparent"}}
                                              onClick={() => searchCancel(true)}>
                            <CloseIcon cursor={'pointer'} fontSize={'10'}/>
                        </div> : <div className={styles.inputRight}>⌘K</div>
                        }
                    </InputRightElement>

                </Flex>
            </InputGroup>

            {showCloseIcon && !isProjectRoute && <div className={styles.headerSearchPopupBox}>
                <Flex gap={2} align={'flex-start'} pb={2} className={styles.headerButton} direction={'column'}>
                    <Flex direction={'column'} width={'100%'}>
                        <Button width={'fit-content'} className={styles.headerSearchPopupBoxButton} variant='outline'
                                leftIcon={<FolderIcon/>}>
                            Project
                        </Button>
                        {filteredProjectsAndPeoples && filteredProjectsAndPeoples.length > 0 &&
                        <Flex borderTop={'1px solid rgba(0,0,0, 0.1)'} mt={3} direction={"column"}>
                            {filteredProjectsAndPeoples && filteredProjectsAndPeoples.slice(0, 5).map((item: any, index: number) => (
                                <Text color={'#374151'} fontSize={'13px'} padding={'8px 12px'} cursor={'pointer'}
                                      borderRadius={'3px'} fontWeight={'500'} width={'100%'} key={index}
                                      _hover={{backgroundColor: 'rgba(0,0,0, 0.05)'}}
                                      lineHeight={1} onClick={() => {
                                    setSearchString('');
                                    Router.push(`/projects/${item.id!}`)
                                }} letterSpacing={'-0.13px'}>{item.emoji} {item.name}</Text>
                            ))}
                        </Flex>
                        }

                    </Flex>

                    <Flex direction={'column'} width={'100%'}>
                        <Button width={'fit-content'}
                                className={styles.headerSearchPopupBoxButton} variant='outline' leftIcon={<UserIcon/>}>
                            People
                        </Button>
                        {filteredPeoples && filteredPeoples.length > 0 &&
                        <Flex borderTop={'1px solid rgba(0,0,0, 0.1)'} mt={3} direction={"column"}>
                            {filteredPeoples && filteredPeoples.slice(0, 5).map((item: any, index: number) => (
                                <Flex className={styles.headerSearchbarList} key={index} padding={'8px 12px'}
                                      cursor={'pointer'} borderRadius={'3px'} onClick={() => {
                                    setPeopleArray(item);
                                }}>
                                    <Text color={'#374151'} fontSize={'13px'} fontWeight={'500'} width={'100%'}
                                          lineHeight={1}
                                          letterSpacing={'-0.13px'}>
                                        {item?.email?.name ? <>
                                            {item?.email?.name || ''}
                                            {item?.email?.email ? <>{' <' + item?.email?.email + '>'}</> : ''}
                                        </> : <>{item?.email?.email || ''}</>}
                                    </Text>
                                </Flex>
                            ))}
                        </Flex>
                        }
                    </Flex>
                </Flex>
            </div>}
        </div>
    )
}
