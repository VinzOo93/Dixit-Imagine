import React, { useState } from 'react';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import ImagineScreen from '@screens/ImagineScreen';
import SessionScreen from '@screens/SessionScreen';

export default function App() {
    const [showGame, setShowGame] = useState(false);

    const handleSessionReady = () => {
        setShowGame(true);
    };

    const handleBackToSession = () => {
        setShowGame(false);
    };

    if (showGame) {
        return (
            <SafeAreaProvider>
                <SafeAreaView style={{ flex: 1 }}>
                    <ImagineScreen onBackToSession={handleBackToSession} />
                </SafeAreaView>
            </SafeAreaProvider>
        );
    }

    return (
        <SafeAreaProvider>
            <SafeAreaView style={{ flex: 1 }}>
                <SessionScreen onSessionReady={handleSessionReady} />
            </SafeAreaView>
        </SafeAreaProvider>
    );
}
