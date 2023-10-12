import React from "react";
import {Flex, Text, Progress} from "@chakra-ui/react";


export function ProgressBar(props: any) {
  return (
    <Flex className={'inbox-loader'} maxW={'450px'} w={'100%'} align={'center'} gap={8} justify={'center'}>
      <Flex direction={'column'} maxW={'420px'} width={'100%'} textAlign={'center'} gap={3}>
        <Progress className={'progress-bar'} value={props.loaderPercentage} borderRadius={'4px'} size='xs' backgroundColor={'#F3F4F6'}/>
        <Text fontSize={'11px'} color={'#FF87DB'}>{props.loaderPercentage}%</Text>
      </Flex>
    </Flex>
  )
}
