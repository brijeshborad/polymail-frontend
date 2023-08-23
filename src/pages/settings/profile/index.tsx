import styles from "@/styles/setting.module.css";
import {Button, Flex, GridItem, Heading, Input, Text} from "@chakra-ui/react";
import Image from "next/image";
import React, {ChangeEvent, useEffect, useState} from "react";
import {useDispatch, useSelector} from "react-redux";
import {StateType} from "@/types";
import {getUsersDetails, updateUsersDetails} from "@/redux/users/action-reducer";
import {UserDetails} from "@/models";
import Index from "@/pages/settings";

export default function Profile() {
    const {userDetails} = useSelector((state: StateType) => state.users);
    const dispatch = useDispatch();


    const [profileDetails, setProfileDetails] = useState<UserDetails>({
        firstName: '',
        middleName: '',
        lastName: ''
    });

    const setFullName = (event: ChangeEvent | any, type: string) => {
        if (type === 'firstName' || type === 'middleName' || type === 'lastName') {
            setProfileDetails((prevState) => {
                return {
                    ...prevState, [type]: event.target.value
                }
            });
        }
    }

    useEffect(() => {
        if (userDetails) {
            if (userDetails.firstName) {
                setProfileDetails((prevState) => {
                    return {
                        ...prevState, firstName: userDetails.firstName
                    }
                });
            }

            if (userDetails.middleName) {
                setProfileDetails((prevState) => {
                    return {
                        ...prevState, middleName: userDetails.middleName
                    }
                });
            }

            if (userDetails.lastName) {
                setProfileDetails((prevState) => {
                    return {
                        ...prevState, lastName: userDetails.lastName
                    }
                });
            }

        }
    }, [userDetails]);

    useEffect(() => {
        dispatch(getUsersDetails({}));
    }, [dispatch])

    const submit = () => {
        if (profileDetails) {
            dispatch(updateUsersDetails(profileDetails));
        }
    }
    return (
        <div className={styles.settingProfile}>
            <Index />
            <GridItem w='100%'>
                <Flex direction={'column'} h={'100%'} padding={'50px 40px 40px'}>
                    <Flex direction={'column'} pb={8} mb={8} borderBottom={'1px solid #D9D9D9'}>
                        <Heading as='h4' size='lg' gap={1}> Profile </Heading>
                        <Text fontSize='sm' className={styles.settingSubTitle}>Manage your team and preferences
                            here.</Text>
                    </Flex>

                    <Flex direction={"column"} className={styles.SettingDetails}>
                        <div className={styles.profileDetails}>
                            <div className={styles.ProfileImage}>
                                <Text fontSize='sm' className={styles.ProfileText} mb={3}>Profile Picture</Text>
                                <div className={styles.userImage}>
                                    <Image src="/image/profile.jpg" width="100" height="100" alt=""/>
                                </div>
                            </div>

                            <Flex align={'center'} gap={6} mt={6} mb={6} maxWidth={'320px'}>
                                <div className={styles.profileAccount}>
                                    <Text fontSize={'14px'}>First Name</Text>
                                    <Input placeholder='Enter First Name' value={profileDetails.firstName}
                                           onChange={(event) => setFullName(event, 'firstName')}/>

                                    <Text fontSize={'14px'} mt={2}>Middle Name</Text>
                                    <Input placeholder='Enter Middle Name' value={profileDetails.middleName}
                                           onChange={(event) => setFullName(event, 'middleName')}/>

                                    <Text fontSize={'14px'} mt={2}>Last Name</Text>
                                    <Input placeholder='Enter Last Name' value={profileDetails.lastName}
                                           onChange={(event) => setFullName(event, 'lastName')}/>
                                </div>
                            </Flex>
                        </div>
                        <Flex align={'center'} className={styles.changeProfileButton} gap={5}>
                            <Button height={'auto'} padding={'0'} className={styles.changePassword}
                                    variant='ghost'> Change
                                Password </Button>
                            <Button height={'auto'} padding={'0'} className={styles.deleteProfile}
                                    variant='ghost'> Delete
                                Profile </Button>
                        </Flex>

                        <Flex align={'center'} gap={2} mt={10} className={styles.settingButton}>
                            <Button className={styles.settingSave} onClick={submit}>Save</Button>
                            <Button className={styles.settingCancel}>Cancel</Button>
                        </Flex>
                    </Flex>
                </Flex>
            </GridItem>
        </div>
    )
}
