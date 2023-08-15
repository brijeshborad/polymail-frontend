import {MutableRefObject, useEffect, useState} from "react";

export const useKeyPress = function (targetKey: string, ref: MutableRefObject<any>) {
    const [keyPressed, setKeyPressed] = useState(false);

    useEffect(() => {
        function downHandler(event: KeyboardEvent) {
            if (event.key === targetKey) {
                event.preventDefault();
                setKeyPressed(true);
            }
        }

        const upHandler = (event: KeyboardEvent) => {
            if (event.key === targetKey) {
                event.preventDefault();
                setKeyPressed(false);
            }
        };

        if (ref && ref.current) {
            ref.current.addEventListener("keydown", downHandler, false);
            ref.current.addEventListener("keyup", upHandler, false);
            return function cleanup() {
                ref.current.removeEventListener("keydown", downHandler, false);
                ref.current.removeEventListener("keyup", upHandler, false);
            };
        }
        return () => {}
    }, [targetKey, ref]);

    return keyPressed;
};
