import { StateType } from "@/types";
import { NotificationProps } from "@/types/notifications/notifications";
import dayjs from "dayjs";
import { useEffect } from "react"
import { useSelector } from "react-redux";

export default function Notification() {
  const { event: incomingEvent } = useSelector((state: StateType) => state.globalEvents);

  useEffect(() => {
    setTimeout(() => {
      if (!isPermissionGranted()) {
        if (shouldRequestPermission()) {
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

  function shouldRequestPermission(): boolean {
    const dateAskedNotificationPermission = localStorage.getItem('_dateAskedNotificationPermission')
    const diffInDays = dayjs().diff(dayjs(dateAskedNotificationPermission), 'days')

    if (!dateAskedNotificationPermission || diffInDays > 1) {
      return true
    }
    return false
  }

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
      if (shouldRequestPermission()) {
        requestPermission()
      }
      return
    }

    new window.Notification(notification.title, {
      icon: `${process.env.NEXT_PUBLIC_GOOGLE_AUTH_REDIRECT_URL}image/logo.png`,
      body: notification?.data?.body || 'test...'
    })
  }

  return (
    <></>
  )
}