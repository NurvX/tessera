import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';
import '../style/Global.scss';
import {StepperContainer} from "../components/StepperContainer";
import {useEffect, useState} from "react";
import {EVENT_SELECTION_KEY, STEP_URLS} from "../constants/Constants";
import {useRouter} from "next/router";
import {AnimatePresence} from "framer-motion";

export default function Global({ Component, pageProps }) {
    const router = useRouter();
    const [direction, setDirection] = useState<number>(0);

    useEffect(() => {
        if (window.localStorage.getItem(EVENT_SELECTION_KEY) !== null) return;
        router.push(STEP_URLS[0]).catch(console.log);
    }, []);

    return (
        <StepperContainer onBack={() => setDirection(-1)} onNext={() => setDirection(1)}>
            <AnimatePresence exitBeforeEnter initial={false}>
                <Component {...pageProps} key={router.pathname} direction={direction} />
            </AnimatePresence>
        </StepperContainer>
    );
}
