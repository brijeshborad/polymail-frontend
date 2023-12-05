import React from "react";
import dynamic from 'next/dynamic';

const Picker = dynamic(() => import('emoji-picker-react'), {ssr: false});

export function EmojiMenu(props: any) {
    return (
        <Picker
            autoFocusSearch={true}
            theme={'light' as any}
            emojiStyle={'native' as any}
            searchPlaceholder={'Search Emoji'}
            skinTonePickerLocation={'PREVIEW' as any}
            categories={['smileys_people', 'animals_nature', 'food_drink', 'travel_places', 'activities', 'objects', 'symbols', 'flags'] as any}
            onEmojiClick={(emoji: any) => {
                if (props?.onChange) {
                    props?.onChange(emoji.emoji)
                }
                if (props?.onChangeVisibility) {
                    props?.onChangeVisibility(false)
                }
            }}/>
    )
}
