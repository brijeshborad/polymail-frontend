import {useEffect} from "react";
import {usePathname} from "next/navigation";
import {socketService, threadService} from "@/services";

export const useUrlChangeHook = function () {
    const pathname = usePathname();

    useEffect(() => {
        threadService.cancelThreadSearch(true);
        socketService.cancelThreadSearch(undefined);
    }, [pathname]);
};
