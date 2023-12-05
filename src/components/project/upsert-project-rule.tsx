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
import {useSelector} from "react-redux";
import {StateType} from "@/types";
import {Project, ProjectRules} from "@/models";
import React, {useState} from "react";
import {commonService} from "@/services";

export function UpsertProjectRule({isOpen, onClose, type}: { isOpen: boolean, onClose: any, type: 'create' | 'edit' }) {
    const {projects} = useSelector((state: StateType) => state.projects);
    const {projectRules} = useSelector((state: StateType) => state.commonApis);
    const {selectedAccount} = useSelector((state: StateType) => state.accounts);

    const [projectRuleValues, setProjectRuleValues] = useState<ProjectRules>({});

    function submit() {
        if (type === 'create') {
            let project = [...(projects || [])].find(t => t.id === projectRuleValues.projectId);
            let finalRules: ProjectRules[] = [...(projectRules || [])];
            finalRules.push({
                filterType: projectRuleValues.filterType,
                accountId: selectedAccount?.id,
                projectId: projectRuleValues.projectId,
                project: project,
                value: projectRuleValues.value,
            });
            commonService.setCommonState({projectRules: finalRules});
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
            <ModalBody padding={'16px 12px'}>
                <Flex direction={'column'}>
                    <Text fontSize='10px' color={'#6B7280'} fontWeight={'500'} lineHeight={'normal'} textTransform={'uppercase'} mb={1}>IF EMAIL IS FROM</Text>
                    <Flex border={'1px solid #F3F4F6'} direction={'column'} borderRadius={'12px'} padding={3}>
                        <Flex gap={3}>
                            <Flex className={'custom-radio-button'}>
                                <Radio value='1'>Sender email</Radio>
                            </Flex>

                            <Flex className={'custom-radio-button'}>
                                <Radio value='1'>Sender domain</Radio>
                            </Flex>
                        </Flex>
                    </Flex>
                </Flex>
                <Flex alignItems={'flex-start'} direction={'column'} gap={4}>
                    <FormControl w={'100%'}>
                        <FormLabel>Select project</FormLabel>
                        <Select variant='outline' placeholder='Select Project' value={projectRuleValues.projectId}
                                onChange={(value) => setProjectRuleValues(prevState => ({
                                    ...prevState, projectId: value.target.value
                                }))}>
                            {projects && projects.map((item: Project) => (
                                <option key={item.id} value={item.id}>{item.emoji} {item.name}</option>
                            ))}
                        </Select>
                    </FormControl>
                    <FormControl w={'100%'}>
                        <FormLabel>Select filter type</FormLabel>
                        <RadioGroup onChange={(value) => setProjectRuleValues(prevState => ({
                            ...prevState, filterType: value as any
                        }))} value={projectRuleValues.filterType}>
                            <Stack direction='row'>
                                <Radio value='domain'>Domain</Radio>
                                <Radio value='email'>Email</Radio>
                            </Stack>
                        </RadioGroup>
                    </FormControl>
                    <FormControl w={'100%'}>
                        <FormLabel>Enter filter value</FormLabel>
                        <Input placeholder='Enter filter value' value={projectRuleValues.value}
                               onChange={(e) => setProjectRuleValues(prevState => ({
                                   ...prevState, value: e.target.value
                               }))}/>
                    </FormControl>
                </Flex>
            </ModalBody>

            <ModalFooter className={styles.settingButton} paddingBottom={'40px'}>
                <Button className={styles.settingCancel} colorScheme='blue' mr={3}
                        onClick={onClose}> Cancel </Button>
                <Button className={styles.settingSave} onClick={() => submit()} variant='ghost'>Add</Button>
            </ModalFooter>
        </ModalContent>
    </Modal>
}
