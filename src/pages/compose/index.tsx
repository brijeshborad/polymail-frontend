import React from "react";
import withAuth from "@/components/withAuth";
import {
    Flex,
    Text,
    Grid,
    GridItem,
} from "@chakra-ui/react";
import styles from "@/styles/compose.module.css";
import {
    DisneyDIcon,
} from "@/icons";
import Image from "next/image";
import Thread from "@/pages/compose/thread";
import Draft from "@/pages/compose/draft";


function Compose() {
    return (
        <>
            <Flex direction={'column'} flex={1}>
                <Flex padding={'16px 40px'} backgroundColor={'#FFFFFF'} borderBottom={'1px solid #F3F4F6'} gap={3}>
                    <Flex align={'center'} gap={2} backgroundColor={'#FFFFFF'} border={'1px solid #F3F4F6'} borderRadius={'8px'} padding={'8px'} minWidth={'216px'} maxWidth={'216px'}>
                        <Flex className={styles.disneyIcon} position={'relative'} align={'center'} justify={'center'} borderRadius={'3px'} backgroundColor={'#C5D5ED'} h={'20px'} w={'20px'} >
                            <DisneyDIcon />
                        </Flex>
                        <Text whiteSpace={'nowrap'} overflow={'hidden'} textOverflow={'ellipsis'} fontSize='13px' color={'#0A101D'} flex={'1'}>Handcrafted Frozen Mouse</Text>
                        <Flex className={styles.memberImages}>
                            <div className={styles.memberPhoto}>
                                <Image src="/image/user.png" width="24" height="24" alt=""/>
                            </div>
                        </Flex>
                    </Flex>

                    <Flex align={'center'} gap={2} backgroundColor={'#FFFFFF'} border={'1px solid #F3F4F6'} borderRadius={'8px'} padding={'8px'} minWidth={'216px'} maxWidth={'216px'}>
                        <Flex className={styles.disneyIcon} position={'relative'} align={'center'} justify={'center'} borderRadius={'3px'} backgroundColor={'#C5D5ED'} h={'20px'} w={'20px'} >
                            <DisneyDIcon />
                        </Flex>
                        <Text whiteSpace={'nowrap'} overflow={'hidden'} textOverflow={'ellipsis'} fontSize='13px' color={'#0A101D'} flex={'1'}>Handcrafted Frozen Mouse</Text>
                        <Flex className={styles.memberImages}>
                            <div className={styles.memberPhoto}>
                                <Image src="/image/user.png" width="24" height="24" alt=""/>
                            </div>
                            <div className={styles.memberPhoto}>
                                <Image src="/image/user.png" width="24" height="24" alt=""/>
                            </div>
                            <Flex align={'center'} justify={'center'} fontSize={'9px'} color={'#082561'} className={styles.memberPhoto}>
                                +6
                            </Flex>
                        </Flex>
                    </Flex>

                    <Flex align={'center'} gap={2} backgroundColor={'#FFFFFF'} border={'1px solid #F3F4F6'} borderRadius={'8px'} padding={'8px'} minWidth={'216px'} maxWidth={'216px'}>
                        <Flex className={styles.disneyIcon} position={'relative'} align={'center'} justify={'center'} borderRadius={'3px'} backgroundColor={'#C5D5ED'} h={'20px'} w={'20px'} >
                            <DisneyDIcon />
                        </Flex>
                        <Text whiteSpace={'nowrap'} overflow={'hidden'} textOverflow={'ellipsis'} fontSize='13px' color={'#0A101D'} flex={'1'}>Handcrafted Frozen Mouse</Text>
                        <Flex className={styles.memberImages}>
                            <div className={styles.memberPhoto}>
                                <Image src="/image/user.png" width="24" height="24" alt=""/>
                            </div>
                            <div className={styles.memberPhoto}>
                                <Image src="/image/user.png" width="24" height="24" alt=""/>
                            </div>
                        </Flex>
                    </Flex>

                    <Flex align={'center'} gap={2} backgroundColor={'#FFFFFF'} border={'1px solid #F3F4F6'} borderRadius={'8px'} padding={'8px'} minWidth={'216px'} maxWidth={'216px'}>
                        <Flex className={styles.disneyIcon} position={'relative'} align={'center'} justify={'center'} borderRadius={'3px'} backgroundColor={'#C5D5ED'} h={'20px'} w={'20px'} >
                            <DisneyDIcon />
                        </Flex>
                        <Text whiteSpace={'nowrap'} overflow={'hidden'} textOverflow={'ellipsis'} fontSize='13px' color={'#0A101D'} flex={'1'}>Handcrafted Frozen Mouse</Text>
                    </Flex>

                    <Flex align={'center'} gap={2} backgroundColor={'#FFFFFF'} border={'1px solid #F3F4F6'} borderRadius={'8px'} padding={'8px'} minWidth={'216px'} maxWidth={'216px'}>
                        <Flex className={styles.disneyIcon} position={'relative'} align={'center'} justify={'center'} borderRadius={'3px'} backgroundColor={'#C5D5ED'} h={'20px'} w={'20px'} >
                            <DisneyDIcon />
                        </Flex>
                        <Text whiteSpace={'nowrap'} overflow={'hidden'} textOverflow={'ellipsis'} fontSize='13px' color={'#0A101D'} flex={'1'}>Handcrafted Frozen Mouse</Text>
                        <Flex className={styles.memberImages}>
                            <div className={styles.memberPhoto}>
                                <Image src="/image/user.png" width="24" height="24" alt=""/>
                            </div>
                            <div className={styles.memberPhoto}>
                                <Image src="/image/user.png" width="24" height="24" alt=""/>
                            </div>
                        </Flex>
                    </Flex>

                </Flex>

                <Grid templateColumns='30% auto' flex={1} padding={'32px 40px 0'} gap={6}>
                    <GridItem w='100%' className={styles.mailListTabs}>
                        <Thread/>
                    </GridItem>
                    <GridItem w='100%' paddingBottom={8}>
                        <Draft/>
                    </GridItem>
                </Grid>
            </Flex>


        </>
    )
}

export default withAuth(Compose);
