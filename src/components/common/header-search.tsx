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
import {useSelector} from "react-redux";
import {StateType} from "@/types";
import {useRouter} from "next/router";
import {
    cacheService,
    globalEventService,
    keyNavigationService,
    projectService,
    socketService,
    threadService
} from "@/services";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import {Contacts, Project} from "@/models";
import {matchSorter} from "match-sorter";
import {debounce} from "@/utils/common.functions";

dayjs.extend(customParseFormat)

export function HeaderSearch() {
    const {isThreadSearched} = useSelector((state: StateType) => state.threads);
    const {userDetails} = useSelector((state: StateType) => state.users);
    const {project, projects} = useSelector((state: StateType) => state.projects);
    const {selectedAccount} = useSelector((state: StateType) => state.accounts);
    const {event: incomingEvent} = useSelector((state: StateType) => state.globalEvents);

    const [showCloseIcon, setShowCloseIcon] = useState(false);
    const [searchPopup, showSearchPopup] = useState(false);
    const [searchString, setSearchString] = useState<string>('');
    const searchInputRef = useRef<HTMLInputElement | null>(null);
    const [badges, setBadges] = useState<{ type: string, value: any }[]>([]);
    const [isProjectRoute, setIsProjectRoute] = useState<boolean>(false);
    const [filteredProjectsAndPeoples, setFilteredProjectsAndPeoples] = useState<any>([]);
    const [filteredPeoples, setFilteredPeoples] = useState<any>([]);

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
            setBadges([]);
        }
    }, [isThreadSearched]);

    useEffect(() => {
        if (incomingEvent === 'iframe.clicked') {
            showSearchPopup(false);
            if (!searchString && badges.length <= 0) {
                setShowCloseIcon(false);
            }
        }
    }, [incomingEvent]);

    useEffect(() => {
        if (router.pathname.includes('/projects')) {
            if (router.pathname === '/projects') {
                setIsProjectRoute(true);
                setBadges([{type: 'projects', value: 'Projects'}]);
            }
            if (router.query.project && project) {
                setBadges([{type: 'project', value: project}]);
            }
            setShowCloseIcon(true);
        } else {
            setShowCloseIcon(false);
            setIsProjectRoute(false);
            setBadges([]);
        }
    }, [router.pathname, router.query, project]);

    useEffect(() => {
        if (searchString || badges.length > 0) {
            setShowCloseIcon(true)
        } else {
            setShowCloseIcon(false)
        }
    }, [searchString, badges])

    useEffect(() => {
        if (searchString) {
            if (isProjectRoute) {
                projectService.setProjectSearchString(searchString);
            } else {
                if (router.pathname !== '/inbox') {
                    cacheService.performCacheSearch(searchString, badges);
                }
            }
        }
    }, [searchString, isProjectRoute, project, badges, router.pathname])

    const searchCancel = (callAPI: boolean = false) => {
        if (isProjectRoute && !project) {
            if (callAPI) {
                setBadges([]);
                setSearchString('');
                projectService.setProjectSearchString('');
            }
            return;
        }
        socketService.cancelThreadSearch(userDetails?.id);
        setShowCloseIcon(false);
        showSearchPopup(false);
        if (selectedAccount && selectedAccount.id && callAPI) {
            setBadges([]);
            threadService.cancelThreadSearch(true);
            setSearchString('');
            globalEventService.fireEvent('threads.refresh-with-cache');
        }
    }

    const handleKeyDown = (event: KeyboardEvent | any) => {
        if (event.key === 'Backspace') {
            if (!event.target.value) {
                event.preventDefault();
                if (badges.length > 0) {
                    removeBadge(badges.length - 1);
                }
            }
        }
        if (router.pathname === '/inbox') {
            if (event.key.toLowerCase() === 'enter') {
                searchCancel(false);
                if (searchString || badges.length > 0) {
                    let finalSearchString: string[] = [];
                    badges.forEach((item) => {
                        if (item.type === 'project') {
                            finalSearchString.push(`in:${item.value.id}`);
                        }
                        if (item.type === 'people') {
                            finalSearchString.push(`from:${item.value.email}`);
                        }
                    })
                    finalSearchString.push(searchString);
                    threadService.searchThread();
                    socketService.searchThreads(userDetails?.id, finalSearchString.join(' '));
                    return;
                }
            }
        } else {
            if (event.target.value) {
                threadService.searchThread(true)
            }
        }
    };

    const handleFocus = () => {
        keyNavigationService.toggleKeyNavigation(false);
        setShowCloseIcon(true);
        showSearchPopup(true)
    }

    const handleBlur = () => {
        keyNavigationService.toggleKeyNavigation(true);
    };

    function filterContacts(value: string) {
        if (!value) {
            return [];
        }
        ['from', 'to', 'cc', 'bcc'].forEach(t => {
            value = value.replace(`${t}:`, '').trim()
        })
        let finalContacts: Contacts[] = matchSorter((selectedAccount?.contacts || []), value, {keys: ['email.email', 'email.name']});
        finalContacts = finalContacts.slice(0, finalContacts.length > 5 ? 5 : finalContacts.length);
        return finalContacts.map((contact: Contacts) => ({email: contact.email.email, name: contact.email.name}));
    }

    useEffect(() => {
        if (!searchString) {
            setFilteredPeoples([])
            setFilteredProjectsAndPeoples([])
        } else {
            setFilteredProjectsAndPeoples((projects || []).filter((item: Project) => item.name?.toLowerCase().includes(searchString.replace('in:', '').trim().toLowerCase())));
            setFilteredPeoples(filterContacts(searchString));
        }
    }, [projects, searchString, selectedAccount?.contacts])

    useEffect(() => {
        const clickBox = document.getElementById('clickBox');
        document.addEventListener('click', function (e) {
            if (clickBox && e.target && clickBox.contains(e.target as Node)) {
                setTimeout(() => {
                    if (searchInputRef.current) {
                        searchInputRef.current?.focus();
                    }
                }, 100);
                setShowCloseIcon(true);
                showSearchPopup(true)
            } else {
                debounce(() => {
                    showSearchPopup(false);
                    if (!searchString && badges.length <= 0) {
                        setShowCloseIcon(false);
                    }
                }, 100)
            }
        });
    }, [badges.length, searchString])

    function getSearchPlaceHolder() {
        if (isProjectRoute) {
            if (router.pathname === '/projects') {
                return 'Search projects';
            }
            // if (project) {
            //     return `Search in ${project.name}`
            // }
            return 'Search';
        }
        return 'Search';
    }

    function getBadgeText(badge: any) {
        if (badge.type === 'project') {
            return `in:${badge.value.name}`;
        }
        if (badge.type === 'people') {
            return `from:${(badge.value.name || badge.value.email)}`;
        }
        return badge.value;
    }

    function addBadge(item: any, type: string) {
        setSearchString('');
        setBadges(prevState => [...prevState, {type, value: item}]);
        if (router.pathname !== '/inbox') {
            threadService.searchThread(true);
            // socketService.searchThreads(userDetails?.id, `${item.email}`);
            cacheService.performCacheSearch('', [...badges, {type: 'project', value: item}]);
        }
    }

    function removeBadge(index: number) {
        let currentBadges = [...badges];
        currentBadges.splice(index, 1);
        setBadges(currentBadges);
    }

    return (
        <div id="clickBox"
             className={`${styles.headerSearch} ${searchPopup && !isProjectRoute ? styles.headerSearchPopup : ''}`}
             onFocus={() => handleFocus()}
             onBlur={() => handleBlur()}>
            <InputGroup>
                <Flex className={`${styles.headerSearchInput} ${badges.length === 0 ? styles.headerNoBadge: ''}`}>
                    <SearchIcon/>
                    <Flex gap={2} flex={1} overflow={'auto'} width={'calc(100vw - 810px)'}
                          className={styles.searchBarHeaderInput}>
                            <Flex className={styles.headerSearchChip} alignItems={'center'}
                                  gap={1}>
                                {badges.map((badge: any, index: number) => {
                                    return (
                                        <Badge key={index} textTransform={'none'} backgroundColor={'#ffffff'}
                                               color={'#6B7280'}
                                               borderRadius={'40px'} display={'flex'} alignItems={'center'}
                                               fontSize={'11px'} fontWeight={'500'} padding={'7px 10px'} lineHeight={1}>
                                            {getBadgeText(badge)}
                                            <CloseIcon cursor={'pointer'} width={'8px'} height={'8px'}
                                                       marginLeft={'5px'}
                                                       onClick={(e) => {
                                                           e.preventDefault()
                                                           e.stopPropagation();
                                                           removeBadge(index);
                                                       }}
                                            />
                                        </Badge>
                                    )
                                })}
                            </Flex>
                            <Input
                                // style={{width: Math.max(searchString.length, getSearchPlaceHolder().length) * 7.7 + 'px'}}
                                // className={`${badges.length > 0 ? styles.headerSearchBadgeInput : ''}`}
                                flex={'1'}
                                minWidth={'70px'}
                                type="text"
                                autoComplete={'off'}
                                autoCorrect={'off'}
                                spellCheck={false}
                                placeholder={getSearchPlaceHolder()}
                                onChange={event => {
                                    setSearchString(event.target.value);
                                }}
                                ref={searchInputRef}
                                value={searchString}
                                onKeyDown={e => handleKeyDown(e)}
                            />
                        {/*<Flex >*/}
                        {/*</Flex>*/}
                    </Flex>
                    <InputRightElement>
                        {showCloseIcon ? <div className={styles.inputRight} style={{background: "transparent"}}
                                              onClick={() => searchCancel(true)}>
                            <CloseIcon cursor={'pointer'} fontSize={'10'}/>
                        </div> : <div className={styles.inputRight}>⌘K</div>
                        }
                    </InputRightElement>

                </Flex>
            </InputGroup>

            {searchPopup && !isProjectRoute && <div className={styles.headerSearchPopupBox}>
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
                                      lineHeight={1} onClick={() => addBadge(item, 'project')}
                                      letterSpacing={'-0.13px'}>{item.emoji} {item.name}</Text>
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
                                      cursor={'pointer'} borderRadius={'3px'} onClick={() => addBadge(item, 'people')}
                                >
                                    <Text color={'#374151'} fontSize={'13px'} fontWeight={'500'} width={'100%'}
                                          lineHeight={1}
                                          letterSpacing={'-0.13px'}>
                                        {item?.name ? <>
                                            {item?.name || ''}
                                            {item?.email ? <>{' <' + item?.email + '>'}</> : ''}
                                        </> : <>{item?.email || ''}</>}
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
