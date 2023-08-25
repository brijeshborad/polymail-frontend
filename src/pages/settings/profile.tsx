import styles from "@/styles/setting.module.css";
import {
    Button, Flex, Grid, GridItem, Heading, Input, Text, Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalFooter,
    ModalBody,
    ModalCloseButton, useDisclosure,
} from "@chakra-ui/react";
import Image from "next/image";
import React, {ChangeEvent, ChangeEventHandler, useEffect, useRef, useState} from "react";
import {useDispatch, useSelector} from "react-redux";
import {StateType} from "@/types";
import {
    getProfilePicture,
    getUsersDetails,
    updateUsersDetails,
    uploadProfilePicture
} from "@/redux/users/action-reducer";
import {Account, UserDetails} from "@/models";
import Index from "@/pages/settings/index";
import withAuth from "@/components/withAuth";
import {EditIcon} from "@chakra-ui/icons";
import {removeAccountDetails, updateAccountState} from "@/redux/accounts/action-reducer";
import LocalStorageService from "@/utils/localstorage.service";

function Profile() {
    const {userDetails, profilePicture, profilePictureUpdated} = useSelector((state: StateType) => state.users);
    const dispatch = useDispatch();
    const { isOpen, onOpen, onClose } = useDisclosure()
    const inputFile = useRef<HTMLInputElement | null>(null)
    let {accounts, success, selectedAccount} = useSelector((state: StateType) => state.accounts);


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
       if (profilePictureUpdated) {
            dispatch(getProfilePicture({}));
        }
    }, [dispatch, profilePictureUpdated]);

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
    const [accountData, setAccountData] = useState<Account>();

    const removeAccount = () => {
        if (selectedAccount && selectedAccount.id) {
            setAccountData(selectedAccount)
            dispatch(removeAccountDetails({id: selectedAccount.id}));
        }
    }

    useEffect(() => {
        if (success && accountData && accountData.id) {
            let data = (accounts || []).filter((item: Account) => item.id !== accountData.id)
            LocalStorageService.updateAccount('store', data[0]);

            dispatch(updateAccountState({accounts: data, selectedAccount: data[0]}));
        }
    }, [success, accountData, dispatch])


    function handleFileUpload(event: ChangeEventHandler | any) {
        const file = event.target.files[0];

        event.stopPropagation();
            event.preventDefault();
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = function () {
                if (reader.result) {
                    dispatch(uploadProfilePicture({file}));
                }
            };
            reader.onerror = function (error) {
                console.log('Error: ', error);
            };
    }
    return (
        <div className={styles.setting}>
            <Grid templateColumns='232px auto' gap={6} h={'100%'} minHeight={'calc(100vh - 65px)'}>
                <GridItem w='100%' className={styles.settingSideBar} padding={'40px 30px 40px 40px'}
                          borderRight={'1px solid #E1E3E6'}>
                    <Index />
                </GridItem>
                <GridItem w='100%'>
                    <Flex direction={'column'} h={'100%'} padding={'50px 40px 40px'}>
                        <Flex direction={'column'} pb={8} mb={8} borderBottom={'1px solid #D9D9D9'}>
                            <Heading as='h4' size='lg' gap={1}> Profile </Heading>
                            <Text fontSize='sm' className={styles.settingSubTitle}>Manage your team and preferences
                                here.</Text>
                        </Flex>

                        <Flex direction={"column"} className={styles.SettingDetails}>
                            <div className={styles.settingProfile}>
                                <div className={styles.profileDetails}>
                                    <div className={styles.ProfileImage}>
                                        <Text fontSize='sm' className={styles.ProfileText} mb={3}>Profile Picture</Text>
                                        <div className={styles.userImage}  onClick={() => inputFile.current?.click()}>
                                            {profilePicture && profilePicture.url && <Image src={profilePicture && profilePicture.url} width="100" height="100" alt=""/>}

                                            <div className={styles.userEditIcon}>
                                                <EditIcon/>
                                            </div>
                                            <input type='file' id='file' ref={inputFile} onChange={(e) => handleFileUpload(e)}
                                                   style={{display: 'none'}}/>
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
                                    <Button height={'auto'} padding={'0'} className={styles.changePassword} onClick={onOpen}
                                            variant='ghost'> Change Password </Button>
                                    <Button height={'auto'} padding={'0'} className={styles.deleteProfile}
                                            variant='ghost'> Delete
                                        Profile </Button>
                                </Flex>

                                <Flex align={'center'} gap={2} mt={10} className={styles.settingButton}>
                                    <Button className={styles.settingSave} onClick={submit}>Save</Button>
                                    <Button className={styles.settingCancel}>Cancel</Button>
                                </Flex>
                            </div>
                        </Flex>
                    </Flex>
                </GridItem>
            </Grid>

            <Modal isOpen={isOpen} onClose={onClose} isCentered closeOnOverlayClick={false}>
                <ModalOverlay />
                <ModalContent className={styles.changePasswordModal}>
                    <ModalHeader>Change Password</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <Flex direction={'column'} mb={3}>
                            <Text fontSize={'11px'} fontWeight={600}>Old Password</Text>
                            <Input borderRadius={8} border={'1px solid #E5E5E5'} fontSize={'13px'} placeholder='Enter Old Password' size='sm' />
                        </Flex>
                        <Flex direction={'column'} mb={3}>
                            <Text fontSize={'11px'} fontWeight={600}>New Password</Text>
                            <Input borderRadius={8} border={'1px solid #E5E5E5'} fontSize={'13px'} placeholder='Enter New Password' size='sm' />
                        </Flex>
                        <Flex direction={'column'} mb={3}>
                            <Text fontSize={'11px'} fontWeight={600}>Confirm Password</Text>
                            <Input borderRadius={8} border={'1px solid #E5E5E5'} fontSize={'13px'} placeholder='Confirm Password' size='sm' />
                        </Flex>
                    </ModalBody>

                    <ModalFooter className={styles.modalFooterButton}>
                        <Button className={styles.closeButton} backgroundColor={'#ffffff'} border={'1px solid #000000'} borderRadius={8} height={'auto'} padding={'10px 20px'} color={'#000000'} fontSize={'14px'} mr={3} onClick={onClose}> Close </Button>
                        <Button className={styles.saveButton} backgroundColor={'#000000'} borderRadius={8} height={'auto'} padding={'10px 20px'} color={'#FFFFFF'} fontSize={'14px'} variant='ghost'>Save</Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </div>
    )
}

export default withAuth(Profile)
