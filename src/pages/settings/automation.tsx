import SettingsLayout from "@/pages/settings/settings-layout";
import React, {useEffect, useState} from "react";
import {
    Button,
    Flex,
    Heading,
    Text,
    useDisclosure,
    MenuButton,
    MenuList,
    MenuItem, Menu
} from "@chakra-ui/react";
import withAuth from "@/components/auth/withAuth";
import styles from "@/styles/setting.module.css";
import {MenuIcon} from "@/icons";
import {UpsertProjectRule} from "@/components/project";
import {useDispatch, useSelector} from "react-redux";
import {StateType} from "@/types";
import {GroupedProjectRules, Project, ProjectRules} from "@/models";
import {deleteProjectRules} from "@/redux/projects/action-reducer";
import {keyNavigationService} from "@/services";


function Automation() {
    const {isOpen, onOpen, onClose} = useDisclosure();
    const {projectRules} = useSelector((state: StateType) => state.commonApis);
    const {projects} = useSelector((state: StateType) => state.projects);
    const [actionType, setActionType] = useState<'create' | 'edit'>('create');
    const [editValue, setEditValue] = useState<ProjectRules | null>(null);
    const dispatch = useDispatch();

    const [groupedProjectRules, setGroupedProjectRules] = useState<GroupedProjectRules>({});

    useEffect(() => {
        if (projectRules && projects && projects.length > 0) {
            let groupedValues: GroupedProjectRules = {};
            projectRules.forEach((item: ProjectRules) => {
                let project = [...(projects || [])].find((t: Project) => t.id === item.projectId);
                if (project) {
                    if (!groupedValues[item.projectId!]) {
                        groupedValues[item.projectId!] = {item: project!, values: []};
                    }
                    groupedValues[item.projectId!].values.push({...item, project: project!});
                }
            })
            setGroupedProjectRules(groupedValues);
        }
    }, [projectRules, projects])

    useEffect(() => {
        keyNavigationService.toggleKeyNavigation(!isOpen);
    }, [isOpen])

    function editRule(rule: ProjectRules) {
        let project = [...(projects || [])].find((t: Project) => t.id === rule.projectId);
        setEditValue({...rule, project});
        setActionType('edit');
        onOpen();
    }

    function deleteRule(key: string, index: number) {
        let currentItems = {...groupedProjectRules};
        let deletingRule = {...currentItems[key].values[index]};
        currentItems[key].values.splice(index, 1);
        setGroupedProjectRules(currentItems);
        dispatch(deleteProjectRules({
            body: {
                projectId: deletingRule.projectId,
                ruleId: deletingRule.id
            },
            toaster: {
                success: {
                    type: 'success',
                    title: `Rule for ${deletingRule.project?.name} ${deletingRule.project?.emoji} has been deleted`,
                    desc: 'Rule deleted'
                }
            }
        }))
    }

    return (
        <SettingsLayout>
            <Flex className={styles.settingPageBox} direction={'column'} h={'100%'} padding={'50px 40px 40px 16px'}>
                <Flex justifyContent={'space-between'} alignItems={'center'} pb={10} mb={0}
                      borderBottom={'1px solid #E5E7EB'}>
                    <div>
                        <Heading as='h4' fontSize={'24'} lineHeight={'normal'} color={'#0A101D'} fontWeight={'600'}>Project
                            Automation</Heading>
                        <Text fontSize='14px' className={styles.settingSubTitle}>Manage email automation</Text>
                    </div>
                    <Button onClick={() => {
                        setActionType('create')
                        onOpen();
                    }} className={styles.inviteMemberButton}
                            _hover={{background: '#1F2937'}} fontSize={'14px'}
                            background={'#1F2937'} color={'white'} fontWeight={500} lineHeight={1}
                            height={'fit-content'} padding={'11px 12px'}>Create new rule</Button>
                </Flex>
                <Flex direction={'column'} gap={10} mt={10}>
                    {Object.keys(groupedProjectRules).map((item: string, index: number) => (
                        groupedProjectRules[item].values.length > 0 && <Flex direction={'column'} gap={3} key={index}>
                            <Flex justifyContent={'space-between'} alignItems={'center'} gap={2}>
                                <Flex gap={2} alignItems={'center'}>
                                    <Flex width={'29px'} height={'29px'} borderRadius={'50px'} alignItems={'center'}
                                          justifyContent={'center'}>
                                        {groupedProjectRules[item].item.emoji}
                                    </Flex>
                                    <Text fontSize={'15px'} fontWeight={'600'} color={'#0A101D'}
                                          lineHeight={'normal'}>{groupedProjectRules[item].item.name}</Text>
                                </Flex>
                                <Text fontSize={'11px'} fontWeight={'600'} textTransform={'uppercase'} color={'#9CA3AF'}
                                      lineHeight={'normal'}>{groupedProjectRules[item].values.length} automations</Text>
                            </Flex>

                            {groupedProjectRules[item].values.map((rule: ProjectRules, ruleIndex: number) => (
                                <Flex backgroundColor={'#FFFFFF'} padding={'8px 16px'} borderRadius={'16px'} gap={3}
                                      border={'1px solid #E5E7EB'} alignItems={'center'} cursor={'pointer'}
                                      key={ruleIndex}>
                                    <Flex alignItems={'center'} w={'100%'} gap={6}>
                                        <Flex width={'180px'}>
                                            <Text className={styles.settingPageUnderLine} fontSize='sm'
                                                  color={'#374151'} lineHeight={'1'}>
                                                If {rule.filterType === 'domain' ? 'sender’s domain name' : 'sender'} is</Text>
                                        </Flex>
                                        <Flex maxW={'200px'} minW={'200px'}>
                                            <Flex alignItems={'center'} border={'1px solid #F3F4F6'} borderRadius={8}
                                                  padding={'3px 4px'} gap={1}>
                                                {rule.filterType === 'email' &&
                                                null
                                                    // <Flex width={'20px'} height={'20px'} borderRadius={'30px'}
                                                    //       alignItems={'center'} overflow={'hidden'}
                                                    //       className={styles.automationUserImage}
                                                    //       justifyContent={'center'}>
                                                    //     <Image priority src="/image/profile.jpg" alt="emoji" width={20}
                                                    //            height={20}/>
                                                    // </Flex>
                                                }
                                                <Text className={styles.automationEmail}>{rule.value}</Text>
                                            </Flex>
                                        </Flex>
                                        <Flex width={'100px'}>
                                            <Text fontSize='sm' color={'#374151'} lineHeight={'1'}>add email to</Text>
                                        </Flex>
                                        <Flex alignItems={'center'} border={'1px solid #F3F4F6'} borderRadius={8}
                                              padding={'3px 4px'} gap={1}>
                                            <Flex width={'20px'} height={'20px'} borderRadius={'3px'}
                                                  alignItems={'center'}
                                                  justifyContent={'center'}>
                                                {rule.project?.emoji}
                                            </Flex>
                                            <Text fontSize={'13px'} fontWeight={'500'} color={'#0A101D'}
                                                  lineHeight={'normal'}>{rule.project?.name}</Text>
                                        </Flex>
                                    </Flex>
                                    <Flex>
                                        <Menu isLazy>
                                            <MenuButton borderRadius={4} _hover={{backgroundColor: '#F3F4F6'}}
                                                        className={styles.menuOptionButton}
                                                        backgroundColor={'#FFFFFF'} h={'20px'} fontSize={12} padding={0}
                                                        minW={5} as={Button}>
                                                <MenuIcon/>
                                            </MenuButton>
                                            <MenuList minW={'126px'} className={'drop-down-list'}>
                                                <MenuItem onClick={() => editRule(rule)}>Edit rule</MenuItem>
                                                <MenuItem onClick={() => deleteRule(item, ruleIndex)}
                                                          className={'delete-button'}>Delete rule</MenuItem>
                                            </MenuList>
                                        </Menu>
                                    </Flex>
                                </Flex>
                            ))}
                        </Flex>
                    ))}
                </Flex>
            </Flex>
            <UpsertProjectRule isOpen={isOpen} onClose={onClose} editValue={editValue} type={actionType}/>
        </SettingsLayout>
    )
}

export default withAuth(Automation);
