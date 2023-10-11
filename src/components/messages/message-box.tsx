import styles from "@/styles/Inbox.module.css";
import {Button, Flex, Heading, Menu, MenuButton, MenuItem, MenuList, Text} from "@chakra-ui/react";
import {Time} from "@/components/common";
import {DownloadIcon, MenuIcon} from "@/icons";
import React, {useEffect, useState} from "react";
import {getAttachmentDownloadUrl, updateMessage} from "@/redux/messages/action-reducer";
import {useDispatch, useSelector} from "react-redux";
import {MessageAttachments} from "@/models";
import {StateType} from "@/types";
import {clearDebounce, debounce} from "@/utils/common.functions";
import {EyeSlashedIcon} from "@/icons/eye-slashed.icon";
import Tooltip from "../common/Tooltip";
import {AttachmentIcon} from "@chakra-ui/icons";
import {FileIcon, defaultStyles, DefaultExtensionType} from 'react-file-icon';


export function MessageBox(props: any) {
    const {event: incomingEvent} = useSelector((state: StateType) => state.globalEvents);
    const [isContextMenuOpen, setIsContextMenuOpen] = useState(false)
    const ref = React.useRef(null)
    const iframeRef = React.useRef<HTMLIFrameElement | null | any>(null);
    const [iframeHeight, setIframeHeight] = React.useState("0px");
    const message = props.item
    const {isExpanded} = props
    const [emailList, setEmailList] = useState<any>([]);
    const dispatch = useDispatch();
    const {selectedMessage, error} = useSelector((state: StateType) => state.messages);
    const [isEyeShow, setIsEyeShow] = useState<any>(false);
    const [isMoreDropdownOpen, setIsMoreDropdownOpen] = useState(false)
    const [isMoreClicked, setIsMoreClicked] = useState(false)


    useEffect(() => {
        if (props.threadDetails.to && props.threadDetails.to.length > 1) {
            let myArray = [...props.threadDetails.to]
            myArray.shift();
            setEmailList(myArray)
        }
    }, [props.threadDetails])

    // Set iframe height once content is loaded within iframe
    const onIframeLoad = () => {
        debounce(() => {
            if (iframeRef.current && iframeRef.current.contentWindow) {
                iframeRef.current.contentDocument.body.style.fontFamily = "'Inter', sans-serif";
                iframeRef.current.contentDocument.body.style.fontSize = "14px";
                setIframeHeight((iframeRef.current.contentWindow.document.body.scrollHeight + 20) + "px");
            }
        }, 0);

    };

    useEffect(() => {
        setIsEyeShow(props?.item.scope !== 'visible')
    }, [props?.item.scope, error])

    const setScope = (type: string, item: any) => {
        if (type !== 'visible') {
            setIsEyeShow(true)
        } else {
            setIsEyeShow(false)
        }
        if (item && item.id) {
            let body = {scope: type}
            dispatch(updateMessage({body: {id: item.id, body}}))
        }
    }


    const downloadImage = (item: MessageAttachments) => {
        if (selectedMessage && selectedMessage.id) {
            dispatch(getAttachmentDownloadUrl({body: {id: selectedMessage.id, attachment: item.id}}));
        }
    }

    function showExtensionImages (item: string | undefined) {
        if (item) {
            const parts = item.split('.');
            if (parts.length > 1) {
                const extension: string = parts[parts.length - 1];
                return extension;
            }
        }
        return 'pdf'
    }

    function attachmentsMenu () {
        return <Menu
          isOpen={isMoreDropdownOpen}
          onClose={() => {
              setIsMoreDropdownOpen(false)
              setIsMoreClicked(false)
          }}>
            <MenuButton
              onClick={() => {
                  setIsMoreDropdownOpen(!isMoreDropdownOpen)
                  setIsMoreClicked(true)
              }}
              className={styles.tabListAttachmentButton} minWidth={'1px'} padding={0}
              borderRadius={0} backgroundColor={'transparent'} height={'auto'}
              fontSize={'13px'} color={'#6B7280'} as={Button} mx={1}
              onMouseEnter={() => {
                  clearDebounce();
                  setIsMoreDropdownOpen(true)
              }}
              onMouseLeave={() => {
                  debounce(() => {
                      if(!isMoreClicked) {
                          setIsMoreDropdownOpen(false)
                          setIsMoreClicked(false)
                      }
                  }, 100)
              }}
            >
                <AttachmentIcon />
            </MenuButton>

            <MenuList
              className={`${styles.tabListDropDown} drop-down-list`}
              onMouseEnter={() => {
                  clearDebounce();
                  setIsMoreDropdownOpen(true)
              }}
              onMouseLeave={() => {
                  debounce(() => {
                      if(!isMoreClicked) {
                          setIsMoreDropdownOpen(false)
                          setIsMoreClicked(false)
                      }
                  }, 100)
              }}
            >
                { props.messageAttachments?.map((item: MessageAttachments, i: number) => (
                  <MenuItem gap={2} key={i}>
                      <FileIcon
                        extension={showExtensionImages(item.filename) as DefaultExtensionType}
                        {...defaultStyles[showExtensionImages(item.filename) as DefaultExtensionType]}
                      />                      {item.filename}
                      <div className={`${styles.closeIcon} ${styles.downloadIcon}`}
                           onClick={() => downloadImage(item)}>
                          <DownloadIcon/>
                      </div>
                  </MenuItem>
                ))}

            </MenuList>

        </Menu>
    }

    useEffect(() => {
        if (incomingEvent === 'iframe.clicked') {
            setIsContextMenuOpen(false)
        }
    }, [incomingEvent]);

    return (
        <Flex ref={ref} position={'relative'} direction={'column'}
              className={`${styles.oldMail} ${isExpanded ? styles.lastOpenMail : ''}`} mb={3} gap={4}
              border={'1px solid #E5E7EB'} borderRadius={12} align={'center'} key={props.index}>
            {!isExpanded &&
              <Flex align={'flex-start'} width={'100%'}>
                  <Flex align={'center'} w={'100%'} gap={2} cursor={'pointer'} padding={4} onClick={props?.onClick}>
                      <div className={styles.mailBoxUserImage}>

                      </div>

                      <Flex w={'100%'} direction={'column'}>
                          <Flex align={'center'} justify={'space-between'} mb={1} minH={5}>
                              <Heading as='h6' fontSize={'13px'} color={'#0A101D'} fontWeight={400}
                                       letterSpacing={'-0.13px'}
                                       lineHeight={1}>{message.from.name || message.from.email}</Heading>
                          </Flex>
                          <Text fontSize='13px' letterSpacing={'-0.13px'} color={'#6B7280'} lineHeight={1}
                                fontWeight={400}>
                              <span dangerouslySetInnerHTML={{__html: props?.item.snippet || ''}}/>
                          </Text>
                      </Flex>
                  </Flex>
                  <Flex align={'center'} pt={4} position={'absolute'} right={0} className={styles.mailBoxTime} gap={'6px'}>
                      {isEyeShow ?
                        <Flex align={'center'} justify={'center'} className={styles.hideShowIcon}>
                            <EyeSlashedIcon/>
                        </Flex> : ''}

                      {props.messageAttachments && !!props.messageAttachments.length &&
                      attachmentsMenu()
                      }

                      <span style={{whiteSpace: 'nowrap'}}>
                                    <Time time={props?.item.created || ''} isShowFullTime={true} showTimeInShortForm={false}/>
                                </span>

                      <Menu isOpen={isContextMenuOpen} onClose={() => setIsContextMenuOpen(false)}>
                          <MenuButton
                            onClick={(e) => {
                                e.preventDefault()
                                e.stopPropagation()
                                setIsContextMenuOpen(!isContextMenuOpen)
                            }} className={styles.menuIcon}
                            transition={'all 0.5s'} backgroundColor={'transparent'} fontSize={'12px'}
                            h={'auto'} minWidth={'24px'} padding={'0'} as={Button} rightIcon={<MenuIcon/>}>
                          </MenuButton>
                          <MenuList className={'drop-down-list'}>
                              {props.threadDetails && (
                                <MenuItem
                                  onClick={(e) => {
                                      e.preventDefault()
                                      e.stopPropagation()
                                      if (props.preventSelectingMessage) {
                                          props.preventSelectingMessage()
                                      }
                                      setScope(props.threadDetails.scope === 'visible' ? 'hidden' : 'visible', props.threadDetails)
                                  }}>
                                    {props.threadDetails.scope === 'visible' ? 'Hide from project members' : 'Show to project members'}
                                </MenuItem>
                              )}
                              <MenuItem
                                onClick={() => props.hideAndShowReplayBox('reply', props.threadDetails)}> Reply </MenuItem>
                              <MenuItem
                                onClick={() => props.hideAndShowReplayBox('reply-all', props.threadDetails)}> Reply
                                  All </MenuItem>
                              <MenuItem
                                onClick={() => props.hideAndShowReplayBox('forward', props.threadDetails)}> Forward </MenuItem>
                          </MenuList>
                      </Menu>
                  </Flex>
              </Flex>
            }

            {props.threadDetails && isExpanded &&
            <Flex direction={'column'} w={'100%'} pb={4}>
                <Flex align={'flex-start'}>
                    <Flex align={'center'} w={'100%'} cursor={'pointer'} gap={2} padding={4}
                          onClick={props?.onClick}>
                        <div className={styles.mailBoxUserImage}>

                        </div>
                        <Flex w={'100%'} direction={'column'} pr={'20px'}>
                            <Flex align={'center'} justify={'space-between'} mb={1}>
                                <Flex align={'flex-end'} gap={1}>
                                    <Heading
                                        as='h6' fontSize={'13px'} color={'#0A101D'}
                                        fontWeight={400} letterSpacing={'-0.13px'} lineHeight={1}
                                    >
                                        {message.from?.name || message.from.email}
                                    </Heading>
                                    {message.from?.name && (
                                        <>
                                            <span className={'dot'}/>
                                            <Text
                                                fontSize='12px' letterSpacing={'-0.13px'}
                                                color={'#6B7280'} lineHeight={1}
                                                fontWeight={400}
                                            >
                                                {props.threadDetails.from.email}
                                            </Text>
                                        </>
                                    )}
                                </Flex>
                            </Flex>
                            {props.threadDetails && props.threadDetails.to && props.threadDetails.to.length > 0 &&
                            <Flex fontSize='12px' letterSpacing={'-0.13px'} color={'#6B7280'} lineHeight={1}
                                  fontWeight={400}>to:&nbsp;
                                {props.threadDetails.to[0].email}&nbsp;

                                <div className={styles.otherMail}>
                                  <Tooltip
                                    placement="bottom"
                                    label={(emailList || []).map((item: any, index: number) => (
                                        <p key={index}>{item.email}</p>
                                    ))}>
                                    <Text
                                        as='u'>{props.threadDetails.to.length - 1 > 0 && `and ${props.threadDetails.to.length - 1} others`} </Text>
                                  </Tooltip>
                                </div>
                            </Flex>
                            }
                        </Flex>
                    </Flex>
                    <Flex align={'center'} gap={'6px'} pt={4} position={'absolute'} right={0}>
                        {isEyeShow ?
                            <Flex align={'center'} justify={'center'} className={styles.hideShowIcon}>
                                <EyeSlashedIcon/>
                            </Flex> : ''}
                        {props.messageAttachments && !!props.messageAttachments.length &&
                            attachmentsMenu()
                        }

                        {/*
                                  <Flex className={styles.memberImages}>
                                      <div className={styles.memberPhoto}>
                                          <Image src="/image/user.png" width="24" height="24" alt=""/>
                                      </div>
                                      <div className={styles.memberPhoto}>
                                          <Image src="/image/user.png" width="24" height="24" alt=""/>
                                      </div>
                                      <Flex align={'center'} justify={'center'} fontSize={'9px'} color={'#082561'}
                                            className={styles.memberPhoto}>
                                          +4
                                      </Flex>
                                  </Flex>*/}
                        <div className={styles.mailBoxTime} style={{whiteSpace: 'nowrap'}}>
                            <Time time={props.threadDetails?.created || ''} isShowFullTime={true}
                                  showTimeInShortForm={false}/>
                        </div>
                        <Menu isOpen={isContextMenuOpen} onClose={() => setIsContextMenuOpen(false)}>
                            <MenuButton
                                onClick={() => setIsContextMenuOpen(true)} className={styles.menuIcon}
                                transition={'all 0.5s'} backgroundColor={'transparent'} fontSize={'12px'}
                                h={'auto'} minWidth={'24px'} padding={'0'} as={Button} rightIcon={<MenuIcon/>}>
                            </MenuButton>
                            <MenuList className={'drop-down-list'}>
                                {props.threadDetails && (
                                    <MenuItem
                                        onClick={(e) => {
                                            e.preventDefault()
                                            e.stopPropagation()
                                            if (props.preventSelectingMessage) {
                                                props.preventSelectingMessage()
                                            }
                                            setScope(props.threadDetails.scope === 'visible' ? 'hidden' : 'visible', props.threadDetails)
                                        }}>
                                        {props.threadDetails.scope === 'visible' ? 'Hide from project members' : 'Show to project members'}
                                    </MenuItem>
                                )}
                                <MenuItem
                                    onClick={() => props.hideAndShowReplayBox('reply', props.threadDetails)}> Reply </MenuItem>
                                <MenuItem
                                    onClick={() => props.hideAndShowReplayBox('reply-all', props.threadDetails)}> Reply
                                    All </MenuItem>
                                <MenuItem
                                    onClick={() => props.hideAndShowReplayBox('forward', props.threadDetails)}> Forward </MenuItem>
                            </MenuList>
                        </Menu>
                    </Flex>

                </Flex>

                {(!props.isLoading && props.emailPart) &&
                <div className={styles.mailBodyContent}>
                    <iframe
                        ref={iframeRef}
                        scrolling="no"
                        onLoad={onIframeLoad}
                        height={iframeHeight}
                        src={props.emailPart}
                        className={styles.mailBody}
                    />
                </div>}
            </Flex>
            }
        </Flex>
    )
}

