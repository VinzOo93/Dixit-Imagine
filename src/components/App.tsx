import React from 'react';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import ImagineScreen from '@screens/ImagineScreen';

export default function App() {
    return (
        <SafeAreaProvider>
            <SafeAreaView style={{ flex: 1 }}>
                <ImagineScreen />
            </SafeAreaView>
        </SafeAreaProvider>
    );
}
