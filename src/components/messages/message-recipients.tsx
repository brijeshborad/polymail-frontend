import {
  Flex, Heading, Input
} from "@chakra-ui/react";
import styles from "@/styles/Inbox.module.css";
import { Chip } from "@/components/common";
import { MessageRecipientsType } from "@/types/props-types/message-recipients.type";
import { MessageRecipient } from "@/models/message";

export default function MessageRecipients({ emailRecipients, handleKeyDown, handleChange, handlePaste, handleItemDelete }: MessageRecipientsType) {
  return (
    <Flex className={styles.mailRecipientsBox} flex={'none'} backgroundColor={'#FFFFFF'}
      border={'1px solid #E5E7EB'} direction={'column'}
      borderRadius={8}>
      <Flex width={'100%'} gap={2} padding={'4px 16px'} className={styles.replyBoxCC}>
        <Heading as={'h6'} fontSize={'13px'} paddingTop={1} fontWeight={500} lineHeight={1}
          color={'#374151'}>To:</Heading>
        <Flex alignItems={'center'} wrap={'wrap'} width={'100%'} gap={1}>
          {!!emailRecipients?.recipients?.items?.length && emailRecipients.recipients.items.map((item: MessageRecipient, i: number) => (
            <Chip text={item.email} key={i} click={() => handleItemDelete(item.email!, 'recipients')} />
          ))}

          <Input width={'auto'} padding={0} height={'20px'} flex={'1 0 auto'}
            fontSize={'12px'} border={0} className={styles.ccInput}
            value={emailRecipients.recipients.value.email}
            onKeyDown={(e) => handleKeyDown(e, 'recipients')}
            onChange={(e) => handleChange(e, 'recipients')}
            onPaste={(e) => handlePaste(e, 'recipients')}
            placeholder={'Recipient\'s Email'}
          />
        </Flex>
      </Flex>
      <Flex width={'100%'} gap={2} padding={'4px 16px'} className={styles.replyBoxCC}>
        <Heading as={'h6'} fontSize={'13px'} paddingTop={1} fontWeight={500} lineHeight={1}
          color={'#374151'}>Cc:</Heading>
        <Flex alignItems={'center'} wrap={'wrap'} width={'100%'} gap={1}>
          {!!emailRecipients?.cc?.items?.length && emailRecipients.cc.items.map((item: MessageRecipient, i: number) => (
            <Chip text={item.email} key={i} click={() => handleItemDelete(item.email!, 'cc')} />
          ))}

          <Input width={'auto'} padding={0} height={'23px'}
            fontSize={'12px'}
            value={emailRecipients.cc.value.email}
            onKeyDown={(e) => handleKeyDown(e, 'cc')}
            onChange={(e) => handleChange(e, 'cc')}
            onPaste={(e) => handlePaste(e, 'cc')}
            border={0} className={styles.ccInput}
          />
        </Flex>
      </Flex>
      <Flex width={'100%'} gap={2} padding={'4px 16px'} className={styles.replyBoxCC}>
        <Heading as={'h6'} fontSize={'13px'} paddingTop={1} fontWeight={500} lineHeight={1}
          color={'#374151'}>Bcc:</Heading>
        <Flex alignItems={'center'} wrap={'wrap'} width={'100%'} gap={1}>
          {!!emailRecipients?.bcc?.items?.length && emailRecipients.bcc.items.map((item: MessageRecipient, i: number) => (
            <Chip text={item.email} key={i} click={() => handleItemDelete(item.email!, 'bcc')} />
          ))}

          <Input width={'auto'} padding={0} height={'23px'}
            fontSize={'12px'}
            value={emailRecipients.bcc.value.email}
            onKeyDown={(e) => handleKeyDown(e, 'bcc')}
            onChange={(e) => handleChange(e, 'bcc')}
            onPaste={(e) => handlePaste(e, 'bcc')}
            border={0} className={styles.ccInput}
          />
        </Flex>
      </Flex>
    </Flex>
  )
}