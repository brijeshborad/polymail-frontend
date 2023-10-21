import withAuth from "@/components/auth/withAuth";
import {Toaster} from "@/components/common";
import {Account, UserDetails} from "@/models";
import SettingsLayout from "@/pages/settings/settings-layout";
import {
    getProfilePicture,
    getUsersDetails,
    removeProfilePicture,
    updateUsersDetails,
    uploadProfilePicture,
    removeProfileData
} from "@/redux/users/action-reducer";
import styles from "@/styles/setting.module.css";
import {StateType} from "@/types";
import LocalStorageService from "@/utils/localstorage.service";
import {EditIcon} from "@chakra-ui/icons";
import {
    Button, Flex, Heading, Input,
    Menu,
    MenuButton,
    MenuItem, MenuList,
    Text, useDisclosure,
} from "@chakra-ui/react";
import Image from "next/image";
import React, {ChangeEvent, ChangeEventHandler, useEffect, useRef, useState} from "react";
import {useDispatch, useSelector} from "react-redux";
import {accountService, userService} from "@/services";
import RemoveRecordModal from "@/components/common/delete-record-modal";
import Router from "next/router";
import {logoutUser} from "@/redux/auth/action-reducer";


function Profile() {
    const {
        userDetails,
        profilePicture,
        profilePictureUpdated,
        userDetailsUpdateSuccess,
        profilePictureRemoved
    } = useSelector((state: StateType) => state.users);
    const dispatch = useDispatch();
    const {isOpen, onOpen, onClose} = useDisclosure()
    const inputFile = useRef<HTMLInputElement | null>(null)
    let {accounts, success} = useSelector((state: StateType) => state.accounts);
    const [isDataUpdate, setIsDataUpdate] = useState<boolean>(false);
    const [accountData] = useState<Account>();
    // let {passwordChangeSuccess} = useSelector((state: StateType) => state.auth);

    const [profileDetails, setProfileDetails] = useState<UserDetails>({
        firstName: '',
        lastName: ''
    });

    // const [passwordUpdate, setPasswordUpdate] = useState<{ old: string, newP: string, confirmP: string }>({
    //     old: '',
    //     newP: '',
    //     confirmP: ''
    // });

    // const [passwordShow, setPasswordShow] = useState<{ old: boolean, newP: boolean, confirmP: boolean }>({
    //     old: false,
    //     newP: false,
    //     confirmP: false
    // });

    // const [passwordMatch, setPasswordMatch] = useState<boolean>(true);

    // const validatePassword = useCallback(() => {
    //     debounce(() => {
    //         setPasswordMatch(passwordUpdate.newP.trim() === passwordUpdate.confirmP.trim())
    //     }, 300);
    // }, [passwordUpdate])


    const setFullName = (event: ChangeEvent | any, type: string) => {
        if (type === 'firstName' || type === 'middleName' || type === 'lastName') {
            setProfileDetails((prevState) => {
                return {
                    ...prevState, [type]: event.target.value
                }
            });
            setIsDataUpdate(true)
        }
    }


    useEffect(() => {
        if (userDetailsUpdateSuccess) {
            userService.setUserState({userDetailsUpdateSuccess: false});
        } else if (profilePictureRemoved) {
            userService.setUserState({profilePictureRemoved: false});
        }
    }, [userDetailsUpdateSuccess, profilePictureRemoved])


    useEffect(() => {
        if (profilePictureUpdated || profilePictureRemoved) {
            dispatch(getProfilePicture({}));
        }
    }, [dispatch, profilePictureUpdated, profilePictureRemoved]);


    useEffect(() => {
        if (userDetails) {
            if (userDetails.firstName) {
                setProfileDetails((prevState) => {
                    return {
                        ...prevState, firstName: userDetails.firstName
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
            dispatch(updateUsersDetails({
                body: profileDetails, toaster: {
                    success: {
                        desc: "Account details updated successfully",
                        title: "Account details updated",
                        type: 'success'
                    }
                }
            }));
            setIsDataUpdate(false);
        }
    }


    const cancelButtonClick = () => {
        if (userDetails) {
            if (userDetails.firstName) {
                setProfileDetails((prevState) => {
                    return {
                        ...prevState, firstName: userDetails.firstName
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
        setIsDataUpdate(false);
    }


    useEffect(() => {
        if (success && accountData && accountData.id) {
            let data = (accounts || []).filter((item: Account) => item.id !== accountData.id)
            LocalStorageService.updateAccount('store', data[0]);
            accountService.setAccountState({accounts: data, selectedAccount: data[0]});
        }
    }, [success, accountData, dispatch, accounts])


    // useEffect(() => {
    //     if (passwordUpdate.newP && passwordUpdate.confirmP) {
    //         validatePassword();
    //     } else {
    //         setPasswordMatch(true);
    //     }
    // }, [passwordUpdate.newP, passwordUpdate.confirmP, validatePassword])


    function handleFileUpload(event: ChangeEventHandler | any) {
        const file = event.target.files[0];
        const contentType = file.name.split('.').pop();
        if (!['jpg', 'gif', 'png', 'jpeg', 'svg'].includes(contentType)) {
            let validationError = {
                desc: 'Only .jpg, .gif, .png, .jpeg and .svg files are allowed',
                title: 'Any file other than image is not valid',
                type: 'error'
            }
            Toaster(validationError)
            return;
        }
        event.stopPropagation();
        event.preventDefault();
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = function () {
            if (reader.result) {
                dispatch(uploadProfilePicture({
                    body: {file: file}
                    ,
                    toaster: {
                        success: {
                            desc: "Profile picture Added successfully",
                            title: "Successfully",
                            type: 'success'
                        }
                    }
                }));
            }
        };
        reader.onerror = function (error) {
            console.log('Error: ', error);
        };
    }


    // function handlePasswordChange(e: KeyboardEvent | any, type: string) {
    //     setPasswordUpdate(prevState => ({
    //         ...prevState,
    //         [type]: e.target.value.trim()
    //     }))
    // }
    //
    //
    // function handlePasswordShow(e: MouseEvent | any, type: string) {
    //     setPasswordShow(prevState => ({
    //         ...prevState,
    //         [type]: !prevState[type as keyof object]
    //     }))
    // }


    // function updatePassword() {
    //     let newPHash = encryptData(passwordUpdate.newP);
    //     dispatch(changePassword({
    //         body: {password: passwordUpdate.old, newPasswordOne: newPHash, newPasswordTwo: newPHash},
    //         toaster: {
    //             success: {
    //                 desc: "Password changed successfully",
    //                 title: "Password changed",
    //                 type: 'success'
    //             }
    //         },
    //     }));
    //     onClose();
    // }


    const removePhoto = () => {
        dispatch(removeProfilePicture({
            toaster: {
                success: {
                    desc: "Profile picture removed successfully",
                    title: "Successfully",
                    type: 'success'
                }
            }
        }));
    }

    const deleteProfileData = () => {
        dispatch(removeProfileData({
            toaster: {
                success: {
                    desc: "Profile removed successfully",
                    title: "Successfully",
                    type: 'success'
                }
            },
            afterSuccessAction: () => {
                dispatch(logoutUser());
                LocalStorageService.clearStorage();
                Router.push('/onboarding/login');
            }
        }));
        onClose();
    }


    return (
        <>
            <SettingsLayout>
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
                                    <div className={styles.profileImageBox}>
                                        <div className={styles.userImage}>
                                            {profilePicture && profilePicture.url &&
                                            <Image src={profilePicture && profilePicture.url} width="100" height="100"
                                                   alt=""/>}
                                        </div>
                                        <Menu>
                                            <MenuButton position={'absolute'} width={'72px'} h={'72px'}
                                                        backgroundColor={'0,0,0, 0.5'} borderRadius={'50px'}
                                                        color={'#FFFFFF'} bottom={0} left={0} zIndex={1} as={Button}
                                                        className={styles.userEditIcon}>
                                                <EditIcon/>
                                            </MenuButton>
                                            <MenuList className={'drop-down-list'}>
                                                <MenuItem onClick={() => inputFile.current?.click()}>Change Photo
                                                    <input type='file' id='file' ref={inputFile} accept={'image/*'}
                                                           onChange={(e) => handleFileUpload(e)}
                                                           style={{display: 'none'}}/>
                                                </MenuItem>
                                                {profilePicture &&
                                                <MenuItem className={'delete-button'} onClick={() => removePhoto()}>Remove
                                                    Photo
                                                </MenuItem>
                                                }
                                            </MenuList>
                                        </Menu>
                                    </div>
                                </div>

                                <Flex align={'center'} gap={6} mt={6} mb={6} maxWidth={'320px'}>
                                    <div className={styles.profileAccount}>
                                        <Text fontSize={'14px'}>First Name</Text>
                                        <Input className={styles.namesInput} placeholder='Enter First Name' value={profileDetails.firstName}
                                               onChange={(event) => setFullName(event, 'firstName')}/>

                                        <Text fontSize={'14px'} mt={5}>Last Name</Text>
                                        <Input className={styles.namesInput} placeholder='Enter Last Name' value={profileDetails.lastName}
                                               onChange={(event) => setFullName(event, 'lastName')}/>
                                    </div>
                                </Flex>
                            </div>
                            <Flex align={'center'} className={styles.changeProfileButton} gap={5}>
                                {/*<Button height={'auto'} padding={'0'} onClick={onOpen}*/}
                                {/*        variant='ghost'> Change Password </Button>*/}
                                <Button height={'auto'} padding={'0'} className={styles.deleteProfile} onClick={onOpen}
                                        variant='ghost'> Delete
                                    Profile </Button>
                            </Flex>
                            {isDataUpdate &&
                            <>
                                <Flex align={'center'} gap={2} mt={10} className={styles.settingButton}>
                                    <Button className={styles.settingSave} onClick={submit}>Save</Button>
                                    <Button className={styles.settingCancel} onClick={cancelButtonClick}>Cancel</Button>
                                </Flex>
                            </>
                            }
                        </div>
                    </Flex>
                </Flex>
            </SettingsLayout>
            {/*<Modal isOpen={isOpen} onClose={onClose} isCentered closeOnOverlayClick={false}>*/}
            {/*    <ModalOverlay/>*/}
            {/*    <ModalContent className={styles.changePasswordModal}>*/}
            {/*        <ModalHeader>Change Password</ModalHeader>*/}
            {/*        <ModalCloseButton/>*/}
            {/*        <ModalBody>*/}
            {/*            <Flex direction={'column'} mb={3}>*/}
            {/*                <Text fontSize={'11px'} fontWeight={600}>Old Password</Text>*/}
            {/*                <InputGroup size='sm'>*/}
            {/*                    <Input tabIndex={1} onChange={(e) => handlePasswordChange(e, 'old')} borderRadius={8}*/}
            {/*                           border={'1px solid #E5E5E5'} fontSize={'13px'} placeholder='Enter Old Password'*/}
            {/*                           size='sm' type={passwordShow['old'] ? 'text' : 'password'}/>*/}
            {/*                    <InputRightElement width='fit-content'>*/}
            {/*                        <Button h='1.75rem' background={"transparent"} size='sm'*/}
            {/*                                onClick={(e) => handlePasswordShow(e, 'old')}>*/}
            {/*                            {passwordShow['old'] ? <ViewOffIcon/> : <ViewIcon/>}*/}
            {/*                        </Button>*/}
            {/*                    </InputRightElement>*/}
            {/*                </InputGroup>*/}
            {/*            </Flex>*/}
            {/*            <Flex direction={'column'} mb={3}>*/}
            {/*                <Text fontSize={'11px'} fontWeight={600}>New Password</Text>*/}
            {/*                <InputGroup size='sm'>*/}
            {/*                    <Input tabIndex={2} onChange={(e) => handlePasswordChange(e, 'newP')} borderRadius={8}*/}
            {/*                           border={'1px solid #E5E5E5'} fontSize={'13px'} placeholder='Enter New Password'*/}
            {/*                           size='sm' type={passwordShow['newP'] ? 'text' : 'password'}/>*/}
            {/*                    <InputRightElement width='fit-content'>*/}
            {/*                        <Button h='1.75rem' background={"transparent"} size='sm'*/}
            {/*                                onClick={(e) => handlePasswordShow(e, 'newP')}>*/}
            {/*                            {passwordShow['newP'] ? <ViewOffIcon/> : <ViewIcon/>}*/}
            {/*                        </Button>*/}
            {/*                    </InputRightElement>*/}
            {/*                </InputGroup>*/}
            {/*            </Flex>*/}
            {/*            <Flex direction={'column'} mb={3}>*/}
            {/*                <Text fontSize={'11px'} fontWeight={600}>Confirm Password</Text>*/}
            {/*                <InputGroup size='sm'>*/}
            {/*                    <Input tabIndex={3} onChange={(e) => handlePasswordChange(e, 'confirmP')}*/}
            {/*                           borderRadius={8}*/}
            {/*                           border={'1px solid #E5E5E5'} fontSize={'13px'} placeholder='Confirm Password'*/}
            {/*                           size='sm' type={passwordShow['confirmP'] ? 'text' : 'password'}*/}
            {/*                           isInvalid={!passwordUpdate}*/}
            {/*                           errorBorderColor={!passwordMatch ? 'crimson' : ''}/>*/}
            {/*                    <InputRightElement width='fit-content'>*/}
            {/*                        <Button h='1.75rem' background={"transparent"} size='sm'*/}
            {/*                                onClick={(e) => handlePasswordShow(e, 'confirmP')}>*/}
            {/*                            {passwordShow['confirmP'] ? <ViewOffIcon/> : <ViewIcon/>}*/}
            {/*                        </Button>*/}
            {/*                    </InputRightElement>*/}
            {/*                </InputGroup>*/}
            {/*                {!passwordMatch &&*/}
            {/*                <Text fontSize={'11px'} fontWeight={600} color={'crimson'}>Passwords do not match</Text>}*/}
            {/*            </Flex>*/}
            {/*        </ModalBody>*/}

            {/*        <ModalFooter className={styles.modalFooterButton}>*/}
            {/*            <Button className={styles.closeButton} backgroundColor={'#ffffff'} border={'1px solid #000000'}*/}
            {/*                    borderRadius={8} height={'auto'} padding={'10px 20px'} color={'#000000'}*/}
            {/*                    fontSize={'14px'} mr={3} onClick={onClose}> Close </Button>*/}
            {/*            <Button className={styles.saveButton} backgroundColor={'#000000'} borderRadius={8}*/}
            {/*                    onClick={() => updatePassword()}*/}
            {/*                    isDisabled={!(passwordUpdate['old'] && passwordUpdate['newP'] && passwordUpdate['confirmP'] && passwordMatch)}*/}
            {/*                    height={'auto'} padding={'10px 20px'} color={'#FFFFFF'} fontSize={'14px'}*/}
            {/*                    variant='ghost'>Save</Button>*/}
            {/*        </ModalFooter>*/}
            {/*    </ModalContent>*/}
            {/*</Modal>*/}

            <RemoveRecordModal onOpen={onOpen} isOpen={isOpen} onClose={onClose}
                               confirmDelete={deleteProfileData}
                               modelTitle={`Are you sure you want to remove your profile?`}/>
        </>
    )
}

export default withAuth(Profile)
