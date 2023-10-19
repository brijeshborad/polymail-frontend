import OnboardingLayout from "@/pages/onboarding/onboarding-layout";
import {Box, Button, Flex, Heading, Input, Menu, MenuButton, MenuItem, MenuList, Text} from "@chakra-ui/react";
import styles from "@/styles/Login.module.css";
import {UploadIcon} from "@/icons";
import Router from "next/router";
import Image from "next/image";
import React, {ChangeEvent, ChangeEventHandler, useEffect, useRef, useState} from "react";
import {useDispatch, useSelector} from "react-redux";
import {StateType} from "@/types";
import {
    getUsersDetails,
    getProfilePicture,
    updateUsersDetails,
    uploadProfilePicture, removeProfilePicture
} from "@/redux/users/action-reducer";
import {SpinnerUI, Toaster} from "@/components/common";
import {getFileSize} from "@/utils/common.functions";
import {useRouter} from "next/router";
import {EditIcon} from "@chakra-ui/icons";


function CompleteProfile() {
    const inputFile = useRef<HTMLInputElement | null>(null)
    const {userDetails, profilePicture, profilePictureUpdated} = useSelector((state: StateType) => state.users);
    const dispatch = useDispatch();
    const router = useRouter();

    const [name, setName] = useState<string>('');
    const [showLoader, setShowLoader] = useState<boolean>(false);

    useEffect(() => {
        if (userDetails) {
            if (userDetails.onboarded === true) {
                router.push('/inbox')
            }
            setName((userDetails.firstName ?? '') + " " + (userDetails.lastName ?? ''))
        }
    }, [router, userDetails]);

    useEffect(() => {
        dispatch(getUsersDetails({}));
        dispatch(getProfilePicture({}));
    }, [dispatch])

    const setFullName = (event: ChangeEvent | any) => {
        setName(event.target.value);
    }

    const submit = () => {
        let tmp = name.split(' ')
        if (name && tmp.length > 1) {
            let firstName = tmp[0]
            let lastName = tmp[tmp.length - 1]
            let body: any = {
                firstName: firstName,
                lastName: lastName
            }
            if (userDetails && !userDetails.onboarded) {
                body = {
                    ...body,
                    onboarded: true
                }
            }
            dispatch(updateUsersDetails({
                body: body,
                toaster: {
                    success: {
                        desc: "Your name added successfully",
                        title: "Full name added success",
                        type: 'success'
                    }
                }
            }));
            Router.push('/inbox');
        } else {
            Toaster({
                title: "Stranger Danger!",
                desc: "Please enter valid a name.",
                type: 'error'
            });
        }
    }

    function handleFileUpload(event: ChangeEventHandler | any) {
        const file = event.target.files[0];
        if (file) {
            const contentType = file.name.split('.').pop();
            if (!['jpg', 'gif', 'png', 'jpeg', 'svg'].includes(contentType)) {
                let validationError = {
                    desc: 'Only .jpg, .gif, .png, .jpeg and .svg files are allowed',
                    title: 'Avatars must be image files.',
                    type: 'error'
                }
                Toaster(validationError)
                return;
            }
            if (getFileSize(file.size) > 10) {
                let validationError = {
                    desc: 'Cannot upload file more than 10MB',
                    title: 'Size limit',
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
                    dispatch(uploadProfilePicture({body: {file: file}}));
                    setShowLoader(true)
                }
            };
            reader.onerror = function (error) {
                console.log('Error: ', error);
            };
        }
    }

    useEffect(() => {
        if (profilePictureUpdated) {
            Toaster({
                desc: "Profile picture added successfully",
                title: "Profile picture added",
                type: 'success'
            });
            dispatch(getProfilePicture({}));
            setShowLoader(false)
        }
    }, [dispatch, profilePictureUpdated]);

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

    return (
        <>
            <OnboardingLayout>
                <Flex direction={'column'} width={'100%'}>
                    <Heading as='h4' size='md' fontWeight={700} color={'#0A101D'} mb={4}>Complete your profile</Heading>
                    <Flex direction={"column"} mb={10} gap={6}>
                        <div>
                            <Text fontSize={'13px'} mb={2} lineHeight={'1'} color={'#374151'}>Full Name</Text>
                            <Input placeholder='Enter Full Name' value={name}
                                   onChange={(event) => setFullName(event)}/>
                        </div>
                        <div>
                            <Flex>
                                <Text fontSize={'13px'} mb={2} lineHeight={'1'} color={'#374151'}>Profile Image </Text>
                                <Text fontSize={'13px'} mb={2} lineHeight={'1'}
                                      color={'#9CA3AF'}>&nbsp;(optional)</Text>
                            </Flex>

                            <Flex className={styles.uploadProfileImage} gap={3} alignItems={'center'} padding={'12px'}
                                  border={'1px solid #E5E7EB'} position={'relative'} borderRadius={'50px'}
                                  minWidth={'300px'}>
                                <div className={styles.userImage}>
                                    <Box w={'50px'} h={'50px'} bg={'#EBF2FF'} display={'flex'} alignItems={'center'}
                                         justifyContent={'center'} borderRadius={'50px'} overflow={'hidden'}>

                                        {profilePicture && profilePicture.url ?
                                            <Image src={profilePicture && profilePicture.url} width="100" height="100"
                                                   alt=""/> : <UploadIcon/>}

                                        <input type='file' id='file' ref={inputFile} accept={'image/*'}
                                               onChange={(e) => handleFileUpload(e)}
                                               style={{display: 'none'}}/>
                                    </Box>
                                    <Menu>
                                        <MenuButton position={'absolute'} width={'50px'} h={'50px'}
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
                                <div onClick={() => inputFile.current?.click()}>
                                    <Heading mb={1} as='h5' fontSize={'15px'} color={'#0A101D'}>Select media to
                                        upload</Heading>
                                    <Text fontSize='xs' color={'#9CA3AF'}>Max size 10MB</Text>
                                </div>
                                <div className={styles.spinner}> {showLoader && <SpinnerUI/>}</div>
                            </Flex>
                        </div>
                    </Flex>
                    <Flex gap={3}>
                        <Button onClick={() => Router.push('/onboarding/connect-account')} className={styles.backButton}
                                height={'auto'} padding={'9px 12px'} backgroundColor={'transparent'}
                                border={'1px solid #374151'} borderRadius={'8px'} fontSize={'14px'}
                                width={'fit-content'} color={'#374151'} lineHeight={'16px'}
                                fontWeight={'500'}>Back</Button>
                        <Button onClick={() => !showLoader ? submit() : null} isDisabled={showLoader}
                                className={styles.continueButton} height={'auto'} padding={'9px 12px'}
                                backgroundColor={'#1F2937'} borderRadius={'8px'} fontSize={'14px'} width={'fit-content'}
                                color={'#ffffff'} lineHeight={'16px'} fontWeight={'500'}>Finish</Button>
                    </Flex>

                </Flex>
            </OnboardingLayout>
        </>
    )
}

export default CompleteProfile;
