import withAuth from "@/components/auth/withAuth";
import {SpinnerUI, Toaster} from "@/components/common";
import {Account, UserDetails} from "@/models";
import SettingsLayout from "@/pages/settings/settings-layout";
import {
    getProfilePicture,
    getUsersDetails,
    removeProfilePicture,
    updateUsersDetails,
    uploadProfilePicture,
    removeProfileData,
    logoutAllUser
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
import {accountService, authService, organizationService, userService} from "@/services";
import RemoveRecordModal from "@/components/common/delete-record-modal";
import Router from "next/router";


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
    const [showLoader, setShowLoader] = useState<boolean>(false);
    const [accountData] = useState<Account>();

    const [profileDetails, setProfileDetails] = useState<UserDetails>({
        firstName: '',
        lastName: ''
    });


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
                    body: {file: file},
                    toaster: {
                        success: {
                            desc: "Profile picture Added successfully",
                            title: "Successfully",
                            type: 'success'
                        }
                    },
                    afterSuccessAction: () => {
                        setShowLoader(false)
                    }
                }));
                setShowLoader(true)
            }
        };
        reader.onerror = function (error) {
            console.log('Error: ', error);
        };
    }

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
                authService.setUser(null);
                accountService.setSelectedAccount(null);
                organizationService.setSelectedOrganization(null);
                setTimeout(() => {
                    LocalStorageService.clearStorage();
                    Router.push('/onboarding/login');
                }, 1000);
            }
        }));
        onClose();
    }

    const logOutAll = () => {
        dispatch(logoutAllUser({
            toaster: {
                success: {
                    desc: "You are logged out from all devices!",
                    title: "Success",
                    type: 'success'
                }
            },
            afterSuccessAction: () => {
                Router.push('/auth/logout');
            }
        }));
    }

    return (
        <>
            <SettingsLayout>
                <Flex className={`${styles.settingPageBox} ${styles.settingsRight}`} direction={'column'}>
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
                                        {showLoader && <div className={styles.spinner}> <SpinnerUI/></div>}
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
                                <Flex gap={2} className={styles.settingButton}>
                                    <Button className={styles.settingSave}  onClick={logOutAll}>Logout All</Button>
                                </Flex>
                                <Button height={'auto'} padding={'0'} className={styles.deleteProfile} onClick={onOpen}
                                        variant='ghost'> Delete
                                    Profile </Button>

                            </Flex>
                            {isDataUpdate &&
                            <>
                                <Flex align={'center'} gap={2} mt={10} className={styles.settingButton}>
                                    <Button className={styles.settingSave} isDisabled={showLoader} onClick={() => !showLoader ? submit() : null}>Save</Button>
                                    <Button className={styles.settingCancel} onClick={cancelButtonClick}>Cancel</Button>
                                </Flex>
                            </>
                            }
                        </div>
                    </Flex>
                </Flex>
            </SettingsLayout>
            <RemoveRecordModal onOpen={onOpen} isOpen={isOpen} onClose={onClose}
                               confirmDelete={deleteProfileData}
                               modelTitle={`Are you sure you want to remove your profile?`}/>
        </>
    )
}

export default withAuth(Profile)
