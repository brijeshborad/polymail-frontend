import React from "react";
import {Flex, Heading, Text, Progress} from "@chakra-ui/react";
import Router from "next/router";


export function InboxLoader(props: any) {
    return (
        <Flex className={'inbox-loader'} maxW={'450px'} w={'100%'} align={'center'} gap={8} justify={'center'} direction={'column'}>
            <Flex direction={'column'} w={'100%'} maxW={'427px'}>
                <Flex className={'inbox-loader-box-3'} mb={'-48px'} direction={"column"} gap={2} w={'100%'} border={'1px solid #E5E7EB'} borderRadius={'8px'} padding={2} background={'#FFFFFF'} boxShadow={'0px 0px 12px 0px rgba(0, 0, 0, 0.08)'}>
                    <Flex background={'#F3F4F6'} padding={'1px'} width={'73px'} borderRadius={'30px'}>
                        <Flex background={'#EBF83E'} h={'18px'} w={'18px'} borderRadius={'20px'} />
                    </Flex>
                    <Flex background={'#F3F4F6'} borderRadius={'20px'} h={'16px'} w={'100%'} />
                </Flex>
                <Flex className={'inbox-loader-box-2'} mb={'-48px'} direction={"column"} gap={2} w={'100%'} border={'1px solid #E5E7EB'} borderRadius={'8px'} padding={2} background={'#FFFFFF'} boxShadow={'0px 0px 12px 0px rgba(0, 0, 0, 0.08)'}>
                    <Flex background={'#F3F4F6'} padding={'1px'} width={'73px'} borderRadius={'30px'}>
                        <Flex background={'#EBF83E'} h={'18px'} w={'18px'} borderRadius={'20px'} />
                    </Flex>
                    <Flex background={'#F3F4F6'} borderRadius={'20px'} h={'16px'} w={'100%'} />
                </Flex>
                <Flex className={'inbox-loader-box'} direction={"column"} gap={2} w={'100%'} border={'1px solid #E5E7EB'} borderRadius={'8px'} padding={2} background={'#FFFFFF'} boxShadow={'0px 0px 12px 0px rgba(0, 0, 0, 0.08)'}>
                    <Flex background={'#F3F4F6'} padding={'1px'} width={'73px'} borderRadius={'30px'}>
                        <Flex background={'#EBF83E'} h={'18px'} w={'18px'} borderRadius={'20px'} />
                    </Flex>
                    <Flex background={'#F3F4F6'} borderRadius={'20px'} h={'16px'} w={'100%'} />
                </Flex>
            </Flex>

            <Flex direction={'column'} w={'100%'} gap={2} textAlign={'center'}>
                <Heading as='h4' fontSize={'24px'} color={'#374151'} fontWeight={'700'}>We are organizing your email</Heading>
                <Flex>
                    <Text color={'#6B7280'} fontWeight={500} lineHeight={'16px'} fontSize='sm'>
                        Feel free to grab a coffee or <Text cursor={'pointer'} as='u' onClick={() => Router.push('/settings/signature')}>craft</Text> the perfect email signature.
                        We’ll send you an email when your inbox is ready.</Text>
                </Flex>
            </Flex>

            <Flex direction={'column'} maxW={'420px'} width={'100%'} textAlign={'center'} gap={3}>
                <Progress className={'progress-bar'} value={props.loaderPercentage} borderRadius={'4px'} size='xs' backgroundColor={'#F3F4F6'}/>
                <Text fontSize={'11px'} color={'#FF87DB'}>{props.loaderPercentage}%</Text>
            </Flex>
        </Flex>
    )
}
