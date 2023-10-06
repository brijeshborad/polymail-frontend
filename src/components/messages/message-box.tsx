import styles from "@/styles/Inbox.module.css";
import {Button, Flex, Heading, Menu, MenuButton, MenuItem, MenuList, Text} from "@chakra-ui/react";
import {Time} from "@/components/common";
import {DownloadIcon, MenuIcon} from "@/icons";
import React, { useEffect, useState } from "react";
import {getAttachmentDownloadUrl, updateMessage} from "@/redux/messages/action-reducer";
import {useDispatch, useSelector} from "react-redux";
import {MessageAttachments} from "@/models";
import {StateType} from "@/types";
import {debounce} from "@/utils/common.functions";
import {EyeSlashedIcon} from "@/icons/eye-slashed.icon";


export function MessageBox(props: any) {
  const { event: incomingEvent } = useSelector((state: StateType) => state.globalEvents);
  const [isContextMenuOpen, setIsContextMenuOpen] = useState(false)
    const ref = React.useRef(null)
    const iframeRef = React.useRef<HTMLIFrameElement | null | any>(null);
    const [iframeHeight, setIframeHeight] = React.useState("0px");
    const message = props.item
    const {isExpanded}=props
    const [emailList, setEmailList] = useState<any>([]);

    useEffect(() => {
      if (props.threadDetails.to && props.threadDetails.to.length > 1) {
        let myArray = [...props.threadDetails.to]
        myArray.shift();
        setEmailList(myArray)
      }
    }, [props.threadDetails])

    const dispatch = useDispatch();
    const {
        selectedMessage
    } = useSelector((state: StateType) => state.messages);

    // Set iframe height once content is loaded within iframe
    const onIframeLoad = () => {
        debounce(() => {
          if (iframeRef.current && iframeRef.current.contentWindow) {
                iframeRef.current.contentDocument.body.style.fontFamily = "'Inter', sans-serif";
                iframeRef.current.contentDocument.body.style.fontSize = "14px";
                setIframeHeight((iframeRef.current.contentWindow.document.body.scrollHeight + 20 ) + "px");
            }
        }, 0);

    };

    const setScope = (type: string, item: any) => {
        if (item && item.id) {
            let body = {
                scope: type
            }
            dispatch(updateMessage({body:{id: item.id, body}}))
        }
    }


    const downloadImage = (item: MessageAttachments) => {
        if (selectedMessage && selectedMessage.id) {
            dispatch(getAttachmentDownloadUrl({body:{id: selectedMessage.id, attachment: item.id}}));
        }
    }

    useEffect(() => {
      if(incomingEvent === 'iframe.clicked') {
        setIsContextMenuOpen(false)
      }
    }, [incomingEvent]);

    return (
      <Flex ref={ref} position={'relative'} direction={'column'}
            className={`${styles.oldMail} ${isExpanded ? styles.lastOpenMail : ''}`} mb={3} gap={4}
            border={'1px solid #E5E7EB'} borderRadius={12} align={'center'} key={props.index}>
          {!isExpanded &&
          <Flex align={'center'} w={'100%'} gap={2} cursor={'pointer'} padding={4} onClick={props?.onClick}>
              <div className={styles.mailBoxUserImage}>

              </div>

              <Flex w={'100%'} direction={'column'}>
                  <Flex align={'center'} justify={'space-between'} mb={1}>
                      <Heading as='h6' fontSize={'13px'} color={'#0A101D'} fontWeight={400}
                                letterSpacing={'-0.13px'} lineHeight={1}>{message.from.name}</Heading>
                      <Flex align={'center'} className={styles.mailBoxTime} gap={3}>
                          {props?.item.scope !== 'visible' ? <Flex align={'center'} justify={'center'} className={styles.hideShowIcon}>
                                <EyeSlashedIcon />
                          </Flex> : ''}
                          <span style={{ marginRight: '20px', marginTop: '5.5px' }}>
                            <Time time={props?.item.created || ''} isShowFullTime={true} showTimeInShortForm={false} />
                          </span>

                          <Menu isOpen={isContextMenuOpen} onClose={() => setIsContextMenuOpen(false)}>
                            <MenuButton
                              onClick={(e) => {
                                e.preventDefault()
                                e.stopPropagation()
                                setIsContextMenuOpen(!isContextMenuOpen)
                              }}
                              position={'absolute'} right={'10px'} top={'20px'} className={styles.menuIcon}
                              transition={'all 0.5s'} backgroundColor={'transparent'} fontSize={'12px'}
                              h={'auto'} minWidth={'24px'} padding={'0'} as={Button} rightIcon={<MenuIcon/>}>
                            </MenuButton>
                            <MenuList className={'drop-down-list'}>
                                {props.threadDetails && (
                                    <MenuItem
                                        onClick={() => setScope(props.threadDetails.scope === 'visible' ? 'hidden' : 'visible', props.threadDetails)}>
                                        {props.threadDetails.scope === 'visible' ? 'Hide from project members' : 'Show to project members'}
                                    </MenuItem>
                                )}
                                <MenuItem onClick={() => props.hideAndShowReplayBox('reply', props.threadDetails)}> Reply </MenuItem>
                                <MenuItem onClick={() => props.hideAndShowReplayBox('reply-all', props.threadDetails)}> Reply All </MenuItem>
                                <MenuItem onClick={() => props.hideAndShowReplayBox('forward', props.threadDetails)}> Forward </MenuItem>
                            </MenuList>
                          </Menu>
                      </Flex>
                  </Flex>
                  <Text fontSize='13px' letterSpacing={'-0.13px'} color={'#6B7280'} lineHeight={1}
                        fontWeight={400}>
                      <span dangerouslySetInnerHTML={{__html: props?.item.snippet || ''}}/>
                  </Text>
              </Flex>
          </Flex>}

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
                                      <span className={'dot'} />
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

                              <Flex align={'center'} gap={'6px'}>
                                  {props?.threadDetails?.scope !== 'visible' ? <Flex align={'center'} justify={'center'} className={styles.hideShowIcon}>
                                      <EyeSlashedIcon />
                                  </Flex> : ''}
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
                                  <div className={styles.mailBoxTime} style={{ marginTop: '5.5px' }}>
                                      <Time time={props.threadDetails?.created || ''} isShowFullTime={true} showTimeInShortForm={false}/>
                                  </div>
                              </Flex>
                          </Flex>
                          {props.threadDetails && props.threadDetails.to && props.threadDetails.to.length > 0 &&
                          <Flex fontSize='12px' letterSpacing={'-0.13px'} color={'#6B7280'} lineHeight={1}
                                fontWeight={400}>to:&nbsp;
                              {props.threadDetails.to[0].email}&nbsp;

                              <div className={styles.otherMail}>
                                  <Text
                                      as='u'>{props.threadDetails.to.length - 1 > 0 && `and ${props.threadDetails.to.length - 1} others`} </Text>
                                  <div className={styles.otherMailList}>
                                    {(emailList || []).map((item: any, index: number) => (
                                      <p key={index}>{item.email}</p>
                                    ))}
                                  </div>
                              </div>
                          </Flex>
                          }
                      </Flex>
                  </Flex>
                  <Menu isOpen={isContextMenuOpen} onClose={() => setIsContextMenuOpen(false)}>
                      <MenuButton
                        onClick={() => setIsContextMenuOpen(true)}
                        position={'absolute'} right={'10px'} top={'20px'} className={styles.menuIcon}
                        transition={'all 0.5s'} backgroundColor={'transparent'} fontSize={'12px'}
                        h={'auto'} minWidth={'24px'} padding={'0'} as={Button} rightIcon={<MenuIcon/>}>
                      </MenuButton>
                      <MenuList className={'drop-down-list'}>
                          {props.threadDetails && (
                              <MenuItem
                                  onClick={() => setScope(props.threadDetails.scope === 'visible' ? 'hidden' : 'visible', props.threadDetails)}>
                                  {props.threadDetails.scope === 'visible' ? 'Hide from project members' : 'Show to project members'}
                              </MenuItem>
                          )}
                          <MenuItem onClick={() => props.hideAndShowReplayBox('reply', props.threadDetails)}> Reply </MenuItem>
                          <MenuItem onClick={() => props.hideAndShowReplayBox('reply-all', props.threadDetails)}> Reply All </MenuItem>
                          <MenuItem onClick={() => props.hideAndShowReplayBox('forward', props.threadDetails)}> Forward </MenuItem>
                      </MenuList>
                  </Menu>
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
              {props.messageAttachments && !!props.messageAttachments.length && props.messageAttachments?.map((item: MessageAttachments, i: number) => (
                  <div className={styles.mailBodyAttachments} key={i}>
                      <Flex align={'center'} className={styles.attachmentsFile}>
                          {item.filename}
                          <div className={`${styles.closeIcon} ${styles.downloadIcon}`}
                                onClick={() => downloadImage(item)}>
                              <DownloadIcon/>
                          </div>
                      </Flex>
                  </div>
              ))}
          </Flex>
          }
      </Flex>
    )
}

