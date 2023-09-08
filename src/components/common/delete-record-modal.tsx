import {Button, Heading, Modal, ModalBody, ModalContent, ModalFooter, ModalOverlay, Text} from "@chakra-ui/react";
import React from "react";
import withAuth from "@/components/auth/withAuth";

function RemoveRecordModal(props: any) {

    return (
        <Modal isOpen={props.isOpen} onClose={props.onClose} isCentered>
            <ModalOverlay backgroundColor={'rgba(229, 231, 235, 0.50)'} backdropFilter={'blur(16px)'}/>
            <ModalContent className={'confirm-modal'} borderRadius={12} boxShadow={'0 0 12px 0 rgba(0,0,0, 0.08)'} padding={'12px'} maxW={'420px'}>
                <ModalBody padding={'12px 12px 24px'}>
                    <Heading as='h5' fontSize={'15px'} color={'#0A101D'} lineHeight={1.21}>Are you sure you want to remove member?</Heading>
                    <Text color={'#6B7280'} mt={1} fontSize='13px'>This action cannot be undone</Text>
                </ModalBody>

                <ModalFooter className={'confirm-modal-footer'} borderTop={'1px solid #F3F4F6'} px={0} pb={0}>
                    <Button className={'cancel-button footer-button'} colorScheme='blue' mr={3} onClick={props.onClose}> Cancel </Button>
                    <Button className={'remove-button footer-button'} variant='ghost'>Remove</Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    )
}

export default withAuth(RemoveRecordModal);
