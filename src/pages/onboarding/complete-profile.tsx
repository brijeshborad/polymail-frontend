import OnboardingLayout from "@/pages/onboarding/onboarding-layout";
import {Box, Button, Flex, Heading, Input, Text} from "@chakra-ui/react";
import styles from "@/styles/Login.module.css";
import {UploadIcon} from "@/icons";
import Router from "next/router";
import Image from "next/image";
import React, {ChangeEvent, ChangeEventHandler, useEffect, useRef, useState} from "react";
import {useDispatch, useSelector} from "react-redux";
import {StateType} from "@/types";
import {getProfilePicture, updateUsersDetails, uploadProfilePicture} from "@/redux/users/action-reducer";
import {SpinnerUI, Toaster} from "@/components/common";
import {getFileSize} from "@/utils/common.functions";


function CompleteProfile() {
    const inputFile = useRef<HTMLInputElement | null>(null)
    const {profilePicture, profilePictureUpdated, userDetailsUpdateSuccess} = useSelector((state: StateType) => state.users);
    const dispatch = useDispatch();

    const [firstName, setFirstName] = useState<any>('');
    const [showLoader, setShowLoader] = useState<boolean>(false);

    const setFullName = (event: ChangeEvent | any) => {
        setFirstName(event.target.value);
    }

    useEffect(() => {
        if (userDetailsUpdateSuccess) {
            Toaster({
                desc: "Your name added successfully",
                title: "Full name added success",
                type: 'success'
            });
            Router.push('/inbox');

        }
    }, [userDetailsUpdateSuccess])

    const submit = () => {
        if (firstName) {
            dispatch(updateUsersDetails({firstName: firstName}));
        } else {
            Toaster({
                desc: "Please valid Enter name",
                title: "Enter valid name",
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
                    title: 'Any file other than image is not valid',
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
                    dispatch(uploadProfilePicture({file}));
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

    return (
        <>
            <OnboardingLayout>
                <Flex direction={'column'} width={'100%'}>
                    <Heading as='h4' size='md' fontWeight={700} color={'#0A101D'} mb={4}>Complete your profile</Heading>
                    <Flex direction={"column"} mb={10} gap={6}>
                        <div>
                            <Text fontSize={'13px'} mb={2} lineHeight={'1'} color={'#374151'}>Full Name</Text>
                            <Input placeholder='Enter Full Name' value={firstName}
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
                                <div className={styles.userImage} onClick={() => inputFile.current?.click()}>
                                    <Box w={'50px'} h={'50px'} bg={'#EBF2FF'} display={'flex'} alignItems={'center'}
                                         justifyContent={'center'} borderRadius={'50px'} overflow={'hidden'}>

                                        {profilePicture && profilePicture.url ?
                                            <Image src={profilePicture && profilePicture.url} width="100" height="100"
                                                   alt=""/> : <UploadIcon/> }

                                        <input type='file' id='file' ref={inputFile}
                                               onChange={(e) => handleFileUpload(e)}
                                               style={{display: 'none'}}/>
                                    </Box>
                                </div>
                                <div>
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
                        <Button onClick={submit}
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
