import React, {useState} from "react";
import {FileIcon} from "@/icons";
import {Flex, Text} from "@chakra-ui/react";
import {clearDebounce, debounce} from "@/utils/common.functions";

export function DropZone({children, onFileUpload, forReply}: any) {
    const [isStartDroperSection, setIsStartDroperSection] = useState<boolean>(false);

    // onDragLeave sets inDropZone to false
    const handleDragLeave = (e: any) => {
        e.preventDefault();
        e.stopPropagation();
        setIsStartDroperSection(false)
    };

    // onDragOver sets inDropZone to true
    const handleDragOver = (e: any) => {
        e.preventDefault();
        e.stopPropagation();
        setIsStartDroperSection(true)
    };

    // onDrop sets inDropZone to false and adds files to fileList
    const handleDrop = (e: any) => {
        e.preventDefault();
        e.stopPropagation();
        setIsStartDroperSection(false);
        clearDebounce('DROP_ZONE');
        if (!e.dataTransfer.files[0]) {
            debounce(() => {
                setIsStartDroperSection(false);
            }, 10)
            return
        }
        if (onFileUpload) {
            onFileUpload(e.dataTransfer.files, e);
        }
    }

    function getDropZone() {
        return (
            <>
                {children}
                <Flex className={'uploadAttachment'} display={isStartDroperSection ? 'flex' : 'none'}
                      position={"absolute"} height={'calc(100% - 32px)'}
                      width={'calc(100% - 32px)'} top={4} left={4} zIndex={7} borderRadius={8}
                      border={'1px dashed #6B7280'} backgroundColor={'#F3F4F6'} align={'center'} justify={'center'}>
                    <FileIcon/>
                    <Text fontSize='13px' color={'#0A101D'} fontWeight={500}>Release to upload attachment</Text>
                </Flex>
            </>
        )
    }

    return (
        forReply ? <div style={{width: '100%', position: 'relative'}} onDragEnter={() => setIsStartDroperSection(true)}
                        onDragOver={(e) => {
                            clearDebounce('DROP_ZONE');
                            handleDragOver(e)
                        }}
                        onDragEnd={(e) => {
                            clearDebounce('DROP_ZONE');
                            handleDragOver(e)
                        }}
                        onDragLeave={(e) => {
                            debounce(() => {
                                handleDragLeave(e)
                            }, 250, 'DROP_ZONE')
                        }}
                        onDrop={(e) => handleDrop(e)}>{getDropZone()}</div> :
            <Flex padding={5} flex={1} position={'relative'} onDragEnter={() => setIsStartDroperSection(true)}
                  onDragOver={(e) => {
                      clearDebounce('DROP_ZONE');
                      handleDragOver(e)
                  }}
                  onDragEnd={(e) => {
                      clearDebounce('DROP_ZONE');
                      handleDragOver(e)
                  }}
                  onDragLeave={(e) => {
                      debounce(() => {
                          handleDragLeave(e)
                      }, 250, 'DROP_ZONE')
                  }}
                  onDrop={(e) => handleDrop(e)}>
                {getDropZone()}
            </Flex>
    )
}
