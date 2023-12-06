import {
    Button,
    Flex, FormControl, FormLabel,
    Heading, Input, Menu, MenuButton, MenuItem, MenuList,
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
import React, {useEffect, useState} from "react";
import {createProjectRules, updateProjectRules} from "@/redux/projects/action-reducer";
import {getAllProjectRules} from "@/redux/common-apis/action-reducer";
import {TriangleDownIcon} from "@chakra-ui/icons";

export function UpsertProjectRule({
                                      isOpen,
                                      onClose,
                                      type,
                                      editValue
                                  }: { isOpen: boolean, onClose: any, type: 'create' | 'edit', editValue: ProjectRules | null }) {
    const {projects} = useSelector((state: StateType) => state.projects);
    const {selectedAccount} = useSelector((state: StateType) => state.accounts);
    const dispatch = useDispatch();

    const [projectRuleValues, setProjectRuleValues] = useState<ProjectRules>({filterType: 'email'});

    useEffect(() => {
        if (type === 'edit' && editValue) {
            setProjectRuleValues({
                filterType: editValue.filterType,
                value: editValue.value,
                projectId: editValue.projectId,
            });
        }
    }, [type, editValue])

    function submit() {
        let body = {
            projectId: projectRuleValues.projectId,
            accountId: selectedAccount?.id,
            filterType: projectRuleValues.filterType,
            value: projectRuleValues.value,
        };
        let toaster = {
            desc: `Rule ${type === 'create' ? 'Created' : 'Updated'}`,
            title: `Rule for ${projectRuleValues.project?.name} ${projectRuleValues.project?.emoji} has been ${type === 'create' ? 'created' : 'updated'}`,
            type: 'success'
        };
        let finalBody: any = {
            body, toaster: {success: toaster},
            afterSuccessAction: () => {
                dispatch(getAllProjectRules({}));
            }
        }
        if (type === 'create') {
            dispatch(createProjectRules(finalBody));
        } else {
            finalBody.body.ruleId = editValue?.id;
            dispatch(updateProjectRules(finalBody))
        }
        setProjectRuleValues({});
        onClose();
    }

    return <Modal isOpen={isOpen} onClose={onClose} isCentered>
        <ModalOverlay backgroundColor={'rgba(229, 231, 235, 0.50)'} backdropFilter={'blur(16px)'}/>
        <ModalContent maxWidth={'360px'} borderRadius={12} boxShadow={'0 0 12px 0 rgba(0,0,0, 0.08)'}>
            <ModalHeader padding={'14px 12px'} borderBottom={'1px solid #F3F4F6'}>
                <Heading as='h3' fontSize={'13px'} fontWeight={'500'} letterSpacing={'-0.13px'}
                         color={'#101828'}> {type === 'create' ? 'Create' : 'Update'} Project Rule </Heading>
            </ModalHeader>
            <ModalCloseButton top={'15px'} right={'12px'} fontSize={'12px'} color={'#6B7280'}
                              className={styles.closeIcon}/>
            <ModalBody padding={'16px 12px'} borderBottom={'1px solid #F3F4F6'}>
                <Flex direction={'column'}>
                    <Text fontSize='10px' color={'#6B7280'} fontWeight={'500'} lineHeight={'normal'}
                          textTransform={'uppercase'} pl={3} mb={1}>IF EMAIL IS FROM</Text>
                    <Flex border={'1px solid #F3F4F6'} direction={'column'} borderRadius={'12px'} padding={3} gap={6}>
                        <RadioGroup onChange={(value) => setProjectRuleValues(prevState => ({
                            ...prevState, filterType: value as any
                        }))} value={projectRuleValues.filterType}>
                            <Stack direction='row' gap={3}>
                                <Flex className={'custom-radio-button'} width={'50%'}>
                                    <Radio value='email'>Sender email</Radio>
                                </Flex>
                                <Flex className={'custom-radio-button'} width={'50%'}>
                                    <Radio value='domain'>Sender domain</Radio>
                                </Flex>
                            </Stack>
                        </RadioGroup>

                        <FormControl w={'100%'}>
                            <FormLabel color={'#374151'} fontSize={'13px'} lineHeight={'1'} letterSpacing={'-0.13px'}
                                       mb={2}>Email Address</FormLabel>
                            <Input border={'1px solid #E5E7EB'} borderRadius={8} color={'#0A101D'} fontSize={'14px'}
                                   h={'36px'}
                                   placeholder={`Enter ${projectRuleValues.filterType === 'domain' ? 'domain' : 'email address'}`}
                                   value={projectRuleValues.value} onChange={(e) => setProjectRuleValues(prevState => ({
                                ...prevState, value: e.target.value
                            }))}/>
                        </FormControl>
                    </Flex>
                </Flex>
                <Flex direction={'column'} mt={'14px'}>
                    <Text fontSize='10px' color={'#6B7280'} fontWeight={'500'} lineHeight={'normal'}
                          textTransform={'uppercase'} pl={3} mb={1}>ADD IT TO</Text>
                    <Flex border={'1px solid #F3F4F6'} direction={'column'} borderRadius={'12px'} padding={3} gap={6}>
                        <FormControl w={'100%'}>
                            <FormLabel color={'#374151'} fontSize={'13px'} lineHeight={'1'} letterSpacing={'-0.13px'}
                                       mb={2}>Project</FormLabel>
                            <Menu isLazy matchWidth={true}>
                                <MenuButton textAlign={'left'} border={'1px solid #E5E7EB'} backgroundColor={'#FFF'}
                                            borderRadius={'8px'} fontSize={'13px'} lineHeight={1} padding={'10px 12px'}
                                            height={'fit-content'} width={'100%'} as={Button}
                                            className={styles.selectProjectButton}
                                            rightIcon={<TriangleDownIcon/>}>
                                    {projectRuleValues.project ? `${projectRuleValues.project.emoji} ${projectRuleValues.project.name}` : 'Select Project'}
                                </MenuButton>
                                <MenuList className={'drop-down-list'}>
                                    {projects && projects.map((item: Project) => (
                                        <MenuItem key={item.id} onClick={() => {
                                            setProjectRuleValues(prevState => ({
                                                ...prevState, projectId: item.id, project: item
                                            }))
                                        }}>{item.emoji} {item.name}</MenuItem>
                                    ))}
                                </MenuList>
                            </Menu>
                        </FormControl>
                    </Flex>
                </Flex>
            </ModalBody>

            <ModalFooter padding={'16px 12px 12px'}>
                <Button borderRadius={'8px'} height={'auto'} fontSize={'14px'} padding={'9px 12px'} mr={3}
                        border={'1px solid #1F2937'} backgroundColor={'#FFF'} color={'#1F2937'}
                        _hover={{backgroundColor: '#FFF', color: '#1F2937'}} onClick={onClose}> Cancel </Button>
                <Button borderRadius={'8px'} height={'auto'} fontSize={'14px'} padding={'9px 12px'} mr={3}
                        border={'1px solid #1F2937'} backgroundColor={'#1F2937'} color={'#FFFFFF'}
                        _hover={{backgroundColor: '#1F2937', color: '#FFFFFF'}} onClick={() => submit()}
                        variant='ghost'>{type === 'create' ? 'Create' : 'Update'} Rule</Button>
            </ModalFooter>
        </ModalContent>
    </Modal>
}
