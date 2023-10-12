import { LinkPreviewProps, PreviewResponseType } from "@/types/props-types/link-preview.types";
import ApiService from "@/utils/api.service";
import { Flex, Skeleton } from "@chakra-ui/react";
import { useEffect, useState } from "react";


export default function LinkPreview({ isVisible, url, top, left }: LinkPreviewProps) {
  const [isBlocked, setIsBlocked] = useState(false)
  const [meta, setMeta] = useState<PreviewResponseType | undefined>()
  const [isLoading, setLoading] = useState<boolean>(true)
  const [cache, setCache] = useState<any>({})
  const blockedPatterns = ['mailto:', 'localhost']

  const isBlockedPattern = (): boolean => {
    let isBlockedPreview = false
    for(let i=0; i<blockedPatterns.length; i++){

      const matches = url?.match(blockedPatterns[i])?.length || 0
      if(matches > 0) {
        isBlockedPreview = true
        break;
      }
    }
    return isBlockedPreview
  }
  
  useEffect(() => {
    if (!url) return

    const isBlocked = isBlockedPattern()

    if(isBlocked) {
      setIsBlocked(isBlocked)
      return
    } else {
      setIsBlocked(false)
    }

    if(cache && cache[url]) {
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

  if (!url || !isVisible || isBlocked) return

  return (
    <div className='link-preview-thumbnail' style={{ top: top - 10, left: left }}>
      <div className='arrow'></div>
      {isLoading ? (
        <div>
          <Flex direction={'column'} gap={'8px'} style={{ paddingTop: 4, paddingBottom: 4 }}>
            <Skeleton
              startColor='#444' endColor='#666'
              width={'100%'}
              height={'12px'}
              borderRadius={'8px'}
              border={'1px solid #E5E7EB'}
            />
            <Skeleton
              startColor='#444' endColor='#666'
              width={'90%'}
              height={'8px'}
              borderRadius={'8px'}
              border={'1px solid #E5E7EB'}
            />
            <Skeleton
              startColor='#444' endColor='#666'
              width={'50%'}
              height={'8px'}
              borderRadius={'8px'}
              border={'1px solid #E5E7EB'}
              style={{ marginTop: '-2px' }}
            />
          </Flex>
        </div>
      ) : (
        <Flex>
          <div className='info'>
            <h2 className='title'>{meta?.title}</h2>
            <p className='description'>{meta?.description}</p>
            <p className='url'>{meta?.website}</p>
          </div>
          {(meta && meta?.image) && (
            <div className='img' style={{ backgroundImage: `url(${meta.image.replace(/&quot;/g, '"')})` }}>
              <img
                src={meta?.image}
                alt={meta?.title || `preview of url: ${url}`}
              />
            </div>
          )}
        </Flex>
      )}
    </div>
  )
}