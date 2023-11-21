import {LinkPreviewProps, PreviewResponseType} from "@/types/props-types/link-preview.types";
import ApiService from "@/utils/api.service";
import {Flex} from "@chakra-ui/react";
import {useEffect, useState} from "react";

/* eslint-disable @next/next/no-img-element */

export default function LinkPreview({isVisible, url, top, left}: LinkPreviewProps) {
    const [isBlocked, setIsBlocked] = useState(false)
    const [meta, setMeta] = useState<PreviewResponseType | undefined>()
    const [isLoading, setLoading] = useState<boolean>(true)
    const [cache, setCache] = useState<any>({})
    const blockedPatterns = ['mailto:', 'localhost']

    const getPlacement = (top: number, left: number) => {
        const topOffset = 130
        const leftOffset = 4

        if (top < topOffset) {
            return {
                type: 'bottom',
                top: 'auto',
                bottom: (top * -1) + 14,
                left: left + leftOffset,
            }
        }
        return {
            type: 'top',
            top: top - topOffset,
            bottom: 'auto',
            left: left + leftOffset,
        }
    }

    const placement = getPlacement(top, left)

    const isBlockedPattern = (): boolean => {
        let isBlockedPreview = false
        for (let i = 0; i < blockedPatterns.length; i++) {

            const matches = url?.match(blockedPatterns[i])?.length || 0
            if (matches > 0) {
                isBlockedPreview = true
                break;
            }
        }
        return isBlockedPreview
    }

    useEffect(() => {
        if (!url) return

        const isBlocked = isBlockedPattern()

        if (isBlocked) {
            setIsBlocked(isBlocked)
            return
        } else {
            setIsBlocked(false)
        }

        if (cache && cache[url]) {
            setMeta(cache[url])
            return
        }

        setLoading(true)
        ApiService.callGet(`/link/preview`, {
            url: url
        })
            .then((data: any) => {
                setLoading(false)
                setCache({
                    ...cache,
                    [url]: data
                })
                setMeta(data)
            })
            .catch(() => {
                setIsBlocked(true)
            })
            .finally(() => {
                setLoading(false)
            })
    }, [url])

    if (!url || !isVisible || isBlocked || isLoading) return

    return (
        <div
            className={`link-preview-thumbnail ${placement.type}`}
            style={{
                top: placement.top,
                left: placement.left,
                bottom: placement.bottom,
                marginTop: meta?.image == '' ? 110 : 0
            }}>
            <div className='arrow'/>
            <Flex className='data'>
                {(meta && meta?.image) && (
                    <div className='img'>
                        <img
                            src={meta?.image}
                            alt={meta?.title || `preview of url: ${url}`}
                            onError={() => {
                                const updatedMeta = {
                                    ...meta,
                                    image: ''
                                }
                                setCache({
                                    ...cache,
                                    [meta.website]: updatedMeta
                                })
                                setMeta(updatedMeta)
                            }}
                        />
                    </div>
                )}
                <div className='info'>
                    <h2 className='title'>{meta?.title}</h2>
                    <p className='description'>{meta?.description}</p>
                    <p className='url'>{meta?.website}</p>
                </div>
            </Flex>
        </div>
    )
}
