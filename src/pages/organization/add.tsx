import Image from "next/image";
import {
    Button,
    Flex, Heading, Input, useToast
} from "@chakra-ui/react";
import React, {useEffect} from "react";
import {StateType} from "@/types";
import styles from "@/styles/Organization.module.css";
import {addOrganization} from "@/redux/organizations/action-reducer";
import {useDispatch, useSelector} from "react-redux";
import Router from "next/router";


export default function AddOrganization() {
    const dispatch = useDispatch();
    const {organization} = useSelector((state: StateType) => state.organizations);
    const {selectedAccount} = useSelector((state: StateType) => state.accounts);
    const [organizationName, setOrganizationName] = React.useState('');

    const handleChange = (event) => {
        setOrganizationName(event.target.value);
    }
    const toast = useToast()
    const toastIdRef = React.useRef()

    const createOrganization = () => {
        if (organizationName.length === 0) {
            toastIdRef.current = toast({description: 'Please add Organization name', status: 'error',})
            return;
        }
        let body = {
            name: organizationName,
            accountId: selectedAccount.id
        }
        dispatch(addOrganization(body));
    }

    useEffect(() => {
        if (organization) {
            Router.push('/inbox');
        }
    }, [organization]);

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

                        <Input name={'myorg'} placeholder={'My Org'} onClick={handleChange}
                               className={`${styles.organizationInput}`} type={'text'}/>
                        <Button className={styles.organizationButton} onClick={() => createOrganization()}
                                py={'25px'}>Create Organization</Button>
                    </Flex>
                </Flex>
            </div>
        </>
    )
}
