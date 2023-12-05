import {
    Button,
    Flex, FormControl, FormLabel,
    Heading, Input,
    Modal,
    ModalBody, ModalCloseButton,
    ModalContent, ModalFooter,
    ModalHeader,
    ModalOverlay, Radio, RadioGroup, Select, Stack, Text
} from "@chakra-ui/react";
import styles from "@/styles/setting.module.css";
import {useDispatch, useSelector} from "react-redux";
import {StateType} from "@/types";
import {Project, ProjectRules} from "@/models";
import React, {useState} from "react";
import {commonService} from "@/services";
import {createProjectRules} from "@/redux/projects/action-reducer";

export function UpsertProjectRule({isOpen, onClose, type}: { isOpen: boolean, onClose: any, type: 'create' | 'edit' }) {
    const {projects} = useSelector((state: StateType) => state.projects);
    const {projectRules} = useSelector((state: StateType) => state.commonApis);
    const {selectedAccount} = useSelector((state: StateType) => state.accounts);
    const dispatch = useDispatch();

    const [projectRuleValues, setProjectRuleValues] = useState<ProjectRules>({});

    function submit() {
        if (type === 'create') {
            let finalRules: ProjectRules[] = [...(projectRules || [])];
            finalRules.push({
                filterType: projectRuleValues.filterType,
                accountId: selectedAccount?.id,
                projectId: projectRuleValues.projectId,
                value: projectRuleValues.value,
            });
            commonService.setCommonState({projectRules: finalRules});
            dispatch(createProjectRules({
                body: {
                    projectId: projectRuleValues.projectId,
                    accountId: selectedAccount?.id,
                    filterType: projectRuleValues.filterType,
                    value: projectRuleValues.value,
                }
            }))
        } else {

        }
        setProjectRuleValues({});
        onClose();
    }

    return <Modal isOpen={isOpen} onClose={onClose} isCentered>
        <ModalOverlay backgroundColor={'rgba(229, 231, 235, 0.50)'} backdropFilter={'blur(16px)'}/>
        <ModalContent maxWidth={'360px'} borderRadius={12} boxShadow={'0 0 12px 0 rgba(0,0,0, 0.08)'}>
            <ModalHeader padding={'14px 12px'} borderBottom={'1px solid #F3F4F6'}>
                <Heading as='h3' fontSize={'13px'} fontWeight={'500'} letterSpacing={'-0.13px'} color={'#101828'}> Create Project Rule </Heading>
            </ModalHeader>
            <ModalCloseButton top={'15px'} right={'12px'} fontSize={'12px'} color={'#6B7280'} className={styles.closeIcon}/>
            <ModalBody padding={'16px 12px'} borderBottom={'1px solid #F3F4F6'}>
                <Flex direction={'column'}>
                    <Text fontSize='10px' color={'#6B7280'} fontWeight={'500'} lineHeight={'normal'} textTransform={'uppercase'} pl={3} mb={1}>IF EMAIL IS FROM</Text>
                    <Flex border={'1px solid #F3F4F6'} direction={'column'} borderRadius={'12px'} padding={3} gap={6}>
                        <Flex gap={3}>
                            <Flex className={'custom-radio-button'} width={'50%'}>
                                <Radio value='1'>Sender email</Radio>
                            </Flex>

                            <Flex className={'custom-radio-button'} width={'50%'}>
                                <Radio value='2'>Sender domain</Radio>
                            </Flex>
                        </Flex>

                        <FormControl w={'100%'}>
                            <FormLabel color={'#374151'} fontSize={'13px'} lineHeight={'1'} letterSpacing={'-0.13px'} mb={2}>Email Address</FormLabel>
                            <Input border={'1px solid #E5E7EB'} borderRadius={8} color={'#0A101D'} fontSize={'14px'} h={'36px'} placeholder='Enter email address' value={projectRuleValues.value}
                                   onChange={(e) => setProjectRuleValues(prevState => ({
                                       ...prevState, value: e.target.value
                                   }))}/>
                        </FormControl>
                    </Flex>
                </Flex>
                <Flex direction={'column'} mt={12}>
                    <Text fontSize='10px' color={'#6B7280'} fontWeight={'500'} lineHeight={'normal'} textTransform={'uppercase'} pl={3} mb={1}>ADD IT TO</Text>
                    <Flex border={'1px solid #F3F4F6'} direction={'column'} borderRadius={'12px'} padding={3} gap={6}>
                        <FormControl w={'100%'}>
                            <FormLabel color={'#374151'} fontSize={'13px'} lineHeight={'1'} letterSpacing={'-0.13px'} mb={2}>Project</FormLabel>
                            <Select border={'1px solid #E5E7EB'} borderRadius={8} color={'#0A101D'} fontSize={'14px'} h={'36px'} variant='outline' placeholder='Select Project' value={projectRuleValues.projectId}
                                    onChange={(value) => setProjectRuleValues(prevState => ({
                                        ...prevState, projectId: value.target.value
                                    }))}>
                                {projects && projects.map((item: Project) => (
                                    <option key={item.id} value={item.id}>{item.emoji} {item.name}</option>
                                ))}
                            </Select>
                        </FormControl>
                    </Flex>
                </Flex>
            </ModalBody>

            <ModalFooter padding={'16px 12px 12px'}>
                <Button borderRadius={'8px'} height={'auto'} fontSize={'14px'} padding={'9px 12px'} mr={3} border={'1px solid #1F2937'} backgroundColor={'#FFF'} color={'#1F2937'} _hover={{backgroundColor: '#1F2937', color: '#FFF'}} onClick={onClose}> Cancel </Button>
                <Button borderRadius={'8px'} height={'auto'} fontSize={'14px'} padding={'9px 12px'} mr={3} border={'1px solid #1F2937'} backgroundColor={'#1F2937'} color={'#FFFFFF'} _hover={{backgroundColor: '#FFFFFF', color: '#1F2937'}} onClick={() => submit()} variant='ghost'>Create Rule</Button>
            </ModalFooter>
        </ModalContent>
    </Modal>
}
