import Image from "next/image";
import {
    AbsoluteCenter,
    Alert,
    Box,
    Button, ButtonGroup,
    Divider,
    Flex, Heading, Input, Modal,
    ModalBody,
    ModalCloseButton,
    ModalContent,
    ModalHeader,
    ModalOverlay, Text, useDisclosure, useToast
} from "@chakra-ui/react";
import React, {useEffect, useState} from "react";
import {StateType} from "@/types";
import styles from "@/styles/Home.module.css";
import {addOrganization, getAllOrganizations} from "@/redux/organizations/action-reducer";
import {useDispatch, useSelector} from "react-redux";
import {InfoIcon} from "@chakra-ui/icons";
import Link from "next/link";


export function AddOrganization(props: any) {
    const {isOpen, onOpen, onClose} = useDisclosure();
    const dispatch = useDispatch();
    const {organization, organizations} = useSelector((state: StateType) => state.organizations);
    const [organizationName, setOrganizationName] = React.useState('');

    const [isShow, setIsShow] = useState(false);

    const handleChange = (event) => {
        setOrganizationName(event.target.value);
    }
    const toast = useToast()
    const toastIdRef = React.useRef()

    const createOrganization = () => {
        if (organizationName.length === 0) {
            toastIdRef.current = toast({description: 'Please add Organization name', status: 'error',})
            props.onClose();
            return;
        }
        let body = {
            name: organizationName,
            accountId: '64cb3e882cba32a99e445cbe'
        }
        dispatch(addOrganization(body));
        props.onClose();
    }

    useEffect(() => {
        console.log('organization', organization);
        if (organization) {
            dispatch(getAllOrganizations({organization: null}, null));
        }
    }, [organization]);

    useEffect(() => {
        console.log('organizations===',organizations);
        if (organizations && organizations.length) {
            setIsShow(true)
        }
    }, [organizations]);

    return (
        <>
            <div className={styles.addOrganizationPage}>
                <Flex justifyContent={'center'} flexDir={'column'} className={styles.addOrganizationBox}>
                    <div className={styles.organizationsPageLogo}>
                        <Image width="30" height="30" src="/image/logo.png" alt=""/>
                    </div>
                    <Flex flex={'1 0 auto'} alignItems={'center'} justifyContent={'center'} flexDir={'column'}
                          className={styles.organizationModal}>
                        <Heading as={'h1'} size='md' pb={5}>Add Organization Name</Heading>

                        <Input name={'myorg'} placeholder={'My Org'}
                               className={`${styles.organizationInput}`} type={'text'}/>
                        <Button className={styles.organizationButton}
                                py={'25px'}>Create Organization</Button>
                    </Flex>
                </Flex>
            </div>
        </>
    )
}
