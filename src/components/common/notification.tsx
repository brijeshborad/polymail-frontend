import { StateType } from "@/types";
import { NotificationProps } from "@/types/notifications/notifications";
import dayjs from "dayjs";
import { useEffect } from "react"
import { useSelector } from "react-redux";

export default function Notification() {
  const { event: incomingEvent } = useSelector((state: StateType) => state.globalEvents);

  useEffect(() => {
    setTimeout(() => {
      const dateAskedNotificationPermission = localStorage.getItem('_dateAskedNotificationPermission')
      if(!isPermissionGranted()) {
        const olderThanAWeek = dayjs(dateAskedNotificationPermission).diff(dayjs(), 'days') >= 7
        if(!dateAskedNotificationPermission || olderThanAWeek) {
          requestPermission()
        }

      }
    }, 2000);


  }, [])

  useEffect(() => {
    const event = incomingEvent as { type: string, data: any }
    if (event && event.type && event.type === 'show-notification') {
      showNotification(event.data)
    }
  }, [incomingEvent])

  function requestPermission() {
    if (!("Notification" in window)) {
      // console.log("Browser does not support desktop notification");
    } else {
      window.Notification.requestPermission().then(() => {
        localStorage.setItem('_dateAskedNotificationPermission', dayjs().format())
      })
    }
  }

  function isPermissionGranted() {
    return window.Notification.permission === 'granted'
  }
  
  function showNotification(notification: NotificationProps) {
    if (!isPermissionGranted()) {
      requestPermission()
      return
    }

    new window.Notification(notification.title, {
      icon: 'https://polymail.com/img/apple-touch-icon.png',
      body: notification?.data?.body || ''
    })
  }
  
  return (
    <></>
  )
}