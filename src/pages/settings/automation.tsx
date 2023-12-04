import SettingsLayout from "@/pages/settings/settings-layout";
import React, {useEffect, useState} from "react";
import {Button, Flex, Heading, Text, Link, useDisclosure} from "@chakra-ui/react";
import withAuth from "@/components/auth/withAuth";
import styles from "@/styles/setting.module.css";
import {TrashIcon} from "@/icons";
import {UpsertProjectRule} from "@/components/project";
import {useSelector} from "react-redux";
import {StateType} from "@/types";
import {GroupedProjectRules, ProjectRules} from "@/models";


function Automation() {
    const {isOpen, onOpen, onClose} = useDisclosure();
    const {projectRules} = useSelector((state: StateType) => state.commonApis);

    const [groupedProjectRules, setGroupedProjectRules] = useState<GroupedProjectRules>({});

    useEffect(() => {
        if (projectRules) {
            let groupedValues: GroupedProjectRules = {};
            projectRules.forEach((item: ProjectRules) => {
                if (!groupedValues[item.projectId!]) {
                    groupedValues[item.projectId!] = {item: item.project!, values: []};
                }
                groupedValues[item.projectId!].values.push(item);
            })
            setGroupedProjectRules(groupedValues);
        }
    }, [projectRules])

    function deleteRule(key: string, index: number) {
        let currentItems = {...groupedProjectRules};
        currentItems[key].values.splice(index, 1);
        setGroupedProjectRules(currentItems);
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
                    <Button onClick={() => onOpen()} className={styles.inviteMemberButton}
                            _hover={{background: '#1F2937'}} fontSize={'14px'}
                            background={'#1F2937'} color={'white'} fontWeight={500} lineHeight={1}
                            height={'fit-content'} padding={'11px 12px'}>Create new rule</Button>
                </Flex>
                <Flex direction={'column'} gap={10} mt={10}>
                    {Object.keys(groupedProjectRules).map((item: string, index: number) => (
                        groupedProjectRules[item].values.length > 0 && <Flex direction={'column'} gap={3} key={index}>
                            <Flex gap={2} alignItems={'center'}>
                                <Flex width={'29px'} height={'29px'} borderRadius={'50px'} alignItems={'center'}
                                      justifyContent={'center'}>
                                    {groupedProjectRules[item].item.emoji}
                                </Flex>
                                <Text fontSize={'15px'} fontWeight={'600'} color={'#0A101D'}
                                      lineHeight={'normal'}>{groupedProjectRules[item].item.name}</Text>
                            </Flex>
                            {groupedProjectRules[item].values.map((rule: ProjectRules, ruleIndex: number) => (
                                <Flex alignItems={'center'} cursor={'pointer'} gap={3} key={ruleIndex}>
                                    <Flex backgroundColor={'#FFFFFF'} border={'1px solid #E5E7EB'}
                                          alignItems={'center'}
                                          padding={'8px 16px'} gap={3} borderRadius={'16px'} w={'fit-content'}>
                                        <Text className={styles.settingPageUnderLine} fontSize='sm'
                                              color={'#374151'}
                                              lineHeight={'1'}>If {rule.filterType === 'domain' ? 'sender’s domain name' : 'sender'} is</Text>
                                        <Flex alignItems={'center'} border={'1px solid #F3F4F6'} borderRadius={8}
                                              padding={'3px 4px'} gap={1}>
                                            {rule.filterType === 'email' &&
                                            <Flex width={'20px'} height={'20px'} borderRadius={'3px'}
                                                  alignItems={'center'}
                                                  justifyContent={'center'}>
                                                😁
                                            </Flex>}
                                            <Link href='#' className={styles.automationEmail}>{rule.value}</Link>
                                        </Flex>
                                        <Text fontSize='sm' color={'#374151'} lineHeight={'1'}>add email to</Text>
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
                                    <Flex className={styles.automationDelete}
                                          onClick={() => deleteRule(item, ruleIndex)}> <TrashIcon/> </Flex>
                                </Flex>
                            ))}
                        </Flex>
                    ))}
                </Flex>
            </Flex>
            <UpsertProjectRule isOpen={isOpen} onClose={onClose} type={'create'}/>
        </SettingsLayout>
    )
}

export default withAuth(Automation);
