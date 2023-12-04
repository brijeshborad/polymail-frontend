import SettingsLayout from "@/pages/settings/settings-layout";
import React from "react";
import {Button, Flex, Heading, Text, Link} from "@chakra-ui/react";
import withAuth from "@/components/auth/withAuth";
import styles from "@/styles/setting.module.css";
import Image from "next/image";
import {TrashIcon} from "@/icons";


function Automation() {

    return (
        <SettingsLayout>
            <Flex className={styles.settingPageBox} direction={'column'} h={'100%'} padding={'50px 40px 40px 16px'}>
                <Flex justifyContent={'space-between'} alignItems={'center'} pb={10} mb={0} borderBottom={'1px solid #E5E7EB'}>
                    <div>
                        <Heading as='h4' fontSize={'24'} lineHeight={'normal'} color={'#0A101D'} fontWeight={'600'} >Project Automation</Heading>
                        <Text fontSize='14px' className={styles.settingSubTitle}>Manage email automation</Text>
                    </div>
                    <Button className={styles.inviteMemberButto} fontSize={'14px'}
                            background={'#1F2937'} color={'white'} fontWeight={500} lineHeight={1}
                            height={'fit-content'} padding={'11px 12px'}>Create new rule</Button>
                </Flex>
                <Flex direction={'column'} gap={10} mt={10}>
                    <Flex direction={'column'} gap={3}>
                        <Flex gap={2} alignItems={'center'}>
                            <Flex width={'29px'} height={'29px'} borderRadius={'50px'} alignItems={'center'} justifyContent={'center'}>
                                😁
                            </Flex>
                            <Text fontSize={'15px'} fontWeight={'600'} color={'#0A101D'} lineHeight={'normal'}> Disney Launch </Text>
                        </Flex>
                        <Flex alignItems={'center'} gap={3}>
                            <Flex backgroundColor={'#FFFFFF'} border={'1px solid #E5E7EB'} alignItems={'center'} padding={'8px 16px'} gap={3} borderRadius={'16px'} w={'fit-content'}>
                                <Text className={styles.settingPageUnderLine} fontSize='sm' color={'#374151'} lineHeight={'1'}>If sender’s domain name is</Text>
                                <Flex alignItems={'center'} border={'1px solid #F3F4F6'} borderRadius={8} padding={'3px 4px'} gap={1}>
                                    {/*<Flex width={'20px'} height={'20px'} borderRadius={'3px'} alignItems={'center'} justifyContent={'center'}>*/}
                                    {/*    😁*/}
                                    {/*</Flex>*/}
                                    <Link href='#' className={styles.automationEmail}> @disney.com </Link>
                                </Flex>
                                <Text fontSize='sm' color={'#374151'} lineHeight={'1'}>add email to</Text>
                                <Flex alignItems={'center'} border={'1px solid #F3F4F6'} borderRadius={8} padding={'3px 4px'} gap={1}>
                                    <Flex width={'20px'} height={'20px'} borderRadius={'3px'} alignItems={'center'} justifyContent={'center'}>
                                        😁
                                    </Flex>
                                    <Text fontSize={'13px'} fontWeight={'500'} color={'#0A101D'} lineHeight={'normal'}> Disney Launch </Text>
                                </Flex>
                            </Flex>
                            {/*<Flex className={styles.automationDelete}> <TrashIcon/> </Flex>*/}
                        </Flex>
                    </Flex>

                    <Flex direction={'column'} gap={3}>
                        <Flex gap={2} alignItems={'center'}>
                            <Flex width={'29px'} height={'29px'} borderRadius={'50px'} alignItems={'center'} justifyContent={'center'}>
                                😁
                            </Flex>
                            <Text fontSize={'15px'} fontWeight={'600'} color={'#0A101D'} lineHeight={'normal'}>Handcrafted Frozen Mouse</Text>
                        </Flex>

                        <Flex alignItems={'center'} gap={3}>
                            <Flex backgroundColor={'#FFFFFF'} border={'1px solid #E5E7EB'} alignItems={'center'} padding={'8px 16px'} gap={3} borderRadius={'16px'} w={'fit-content'}>
                                <Text className={styles.settingPageUnderLine} fontSize='sm' color={'#374151'} lineHeight={'1'}>If sender is</Text>
                                <Flex alignItems={'center'} border={'1px solid #F3F4F6'} borderRadius={8} padding={'3px 4px'} gap={1}>
                                    <Flex width={'20px'} height={'20px'} borderRadius={'3px'} alignItems={'center'} justifyContent={'center'}>
                                        😁
                                    </Flex>
                                    <Link href='#' className={styles.automationEmail}>leclow@djmouse.com</Link>
                                </Flex>
                                <Text fontSize='sm' color={'#374151'} lineHeight={'1'}>add email to</Text>
                                <Flex alignItems={'center'} border={'1px solid #F3F4F6'} borderRadius={8} padding={'3px 4px'} gap={1}>
                                    <Flex width={'20px'} height={'20px'} borderRadius={'3px'} alignItems={'center'} justifyContent={'center'}>
                                        😁
                                    </Flex>
                                    <Text fontSize={'13px'} fontWeight={'500'} color={'#0A101D'} lineHeight={'normal'}>Handcrafted Frozen Mouse</Text>
                                </Flex>
                            </Flex>
                            <Flex className={styles.automationDelete}> <TrashIcon/> </Flex>
                        </Flex>

                        <Flex alignItems={'center'} gap={3}>
                            <Flex backgroundColor={'#FFFFFF'} border={'1px solid #E5E7EB'} alignItems={'center'} padding={'8px 16px'} gap={3} borderRadius={'16px'} w={'fit-content'}>
                                <Text className={styles.settingPageUnderLine} fontSize='sm' color={'#374151'} lineHeight={'1'}>If sender is</Text>
                                <Flex alignItems={'center'} border={'1px solid #F3F4F6'} borderRadius={8} padding={'3px 4px'} gap={1}>
                                    <Flex width={'20px'} height={'20px'} borderRadius={'50px'} overflow={'hidden'} alignItems={'center'} justifyContent={'center'}>
                                        😁
                                    </Flex>
                                    <Link href='#' className={styles.automationEmail}>bane@djmouse.com</Link>
                                </Flex>
                                <Text fontSize='sm' color={'#374151'} lineHeight={'1'}>add email to</Text>
                                <Flex alignItems={'center'} border={'1px solid #F3F4F6'} borderRadius={8} padding={'3px 4px'} gap={1}>
                                    <Flex width={'20px'} height={'20px'} borderRadius={'3px'} alignItems={'center'} justifyContent={'center'} >
                                        😁
                                    </Flex>
                                    <Text fontSize={'13px'} fontWeight={'500'} color={'#0A101D'} lineHeight={'normal'}>Handcrafted Frozen Mouse</Text>
                                </Flex>
                            </Flex>
                            {/*<Flex className={styles.automationDelete}> <TrashIcon/> </Flex>*/}
                        </Flex>

                        <Flex alignItems={'center'} gap={3}>
                            <Flex backgroundColor={'#FFFFFF'} border={'1px solid #E5E7EB'} alignItems={'center'} padding={'8px 16px'} gap={3} borderRadius={'16px'} w={'fit-content'}>
                                <Text className={styles.settingPageUnderLine} fontSize='sm' color={'#374151'} lineHeight={'1'}>If sender is</Text>
                                <Flex alignItems={'center'} border={'1px solid #F3F4F6'} borderRadius={8} padding={'3px 4px'} gap={1}>
                                    <Flex width={'20px'} height={'20px'} borderRadius={'50px'} overflow={'hidden'} alignItems={'center'} justifyContent={'center'}>
                                        😁
                                    </Flex>
                                    <Link href='#' className={styles.automationEmail}>daredj@djmouse.com</Link>
                                </Flex>
                                <Text fontSize='sm' color={'#374151'} lineHeight={'1'}>add email to</Text>
                                <Flex alignItems={'center'} border={'1px solid #F3F4F6'} borderRadius={8} padding={'3px 4px'} gap={1}>
                                    <Flex width={'20px'} height={'20px'} borderRadius={'3px'} alignItems={'center'} justifyContent={'center'}>
                                        😁
                                    </Flex>
                                    <Text fontSize={'13px'} fontWeight={'500'} color={'#0A101D'} lineHeight={'normal'}>Handcrafted Frozen Mouse</Text>
                                </Flex>
                            </Flex>
                            {/*<Flex className={styles.automationDelete}> <TrashIcon/> </Flex>*/}
                        </Flex>

                    </Flex>
                </Flex>
            </Flex>
        </SettingsLayout>
    )
}

export default withAuth(Automation);
