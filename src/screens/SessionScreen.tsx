import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  ScrollView,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { NativeModulesProxy } from 'expo-modules-core';
import QRCode from 'react-native-qrcode-svg';
import SkyBackground from '../components/SkyBackground';

type ScreenMode = 'menu' | 'create' | 'join' | 'session';

type BarCodeScannerResult = { type: string; data: string };

interface SessionConnectionInfo {
  sessionId: string;
  hostIp: string;
  hostPort: number;
  protocol: 'http' | 'https';
}

export default function SessionScreen({ onSessionReady }: { onSessionReady?: () => void }) {
  const [mode, setMode] = useState<ScreenMode>('menu');
  const [participantName, setParticipantName] = useState<string>('');
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [connectionInfo, setConnectionInfo] = useState<SessionConnectionInfo | null>(null);
  const [isHost, setIsHost] = useState(false);

  const [Scanner, setScanner] = useState<any>(null);
  const [scannerKind, setScannerKind] = useState<'barcodescanner' | 'cameraview' | null>(null);
  const [scannerError, setScannerError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const loadScanner = async () => {
      if (mode !== 'join') {
        // Reset permission state when leaving join mode
        setHasPermission(null);
        setScanner(null);
        setScannerKind(null);
        return;
      }
      try {
        // Vérifie la présence du module natif AVANT d'importer le paquet JS pour éviter le crash/iOS redbox
        const hasNative = !!(
          // différents noms possibles selon versions
          (NativeModulesProxy as any)?.ExpoBarCodeScanner ||
          (NativeModulesProxy as any)?.ExpoBarCodeScannerModule ||
          (NativeModulesProxy as any)?.ExpoBarCodeScannerView ||
          (NativeModulesProxy as any)?.ExpoBarCodeScannerViewManager ||
          // expo-camera (nouvelle API CameraView)
          (NativeModulesProxy as any)?.ExpoCamera ||
          (NativeModulesProxy as any)?.ExpoCameraView ||
          (NativeModulesProxy as any)?.ExpoCameraViewManager
        );
        if (!hasNative) {
          setScannerError(
            "Le module natif du scanner n'est pas présent dans cette build. Installez une Dev Client (expo-dev-client) ou utilisez Expo Go compatible, puis reconstruisez."
          );
          setHasPermission(false);
          return;
        }

        const mod: any = await import('expo-camera');
        if (cancelled) return;

        // Préfère CameraView (API récente) puis fallback sur BarCodeScanner (API historique)
        if (mod?.CameraView) {
          const Wrapped = React.forwardRef<any, any>((props, ref) => React.createElement(mod.CameraView, { ...props, ref }));
          setScanner(() => Wrapped);
          setScannerKind('cameraview');
          // Permissions via Camera
          if (mod?.Camera?.requestCameraPermissionsAsync) {
            const { status } = await mod.Camera.requestCameraPermissionsAsync();
            if (cancelled) return;
            setHasPermission(status === 'granted');
          } else if (mod?.requestCameraPermissionsAsync) {
            const { status } = await mod.requestCameraPermissionsAsync();
            if (cancelled) return;
            setHasPermission(status === 'granted');
          } else if (mod?.Camera?.requestPermissionsAsync) {
            const { status } = await mod.Camera.requestPermissionsAsync();
            if (cancelled) return;
            setHasPermission(status === 'granted');
          } else {
            setScannerError('Impossible de demander la permission caméra. Rebuild requis.');
            setHasPermission(false);
          }
        } else if (mod?.BarCodeScanner) {
          const Wrapped = React.forwardRef<any, any>((props, ref) => React.createElement(mod.BarCodeScanner, { ...props, ref }));
          setScanner(() => Wrapped);
          setScannerKind('barcodescanner');
          if (mod?.BarCodeScanner?.requestPermissionsAsync) {
            const { status } = await mod.BarCodeScanner.requestPermissionsAsync();
            if (cancelled) return;
            setHasPermission(status === 'granted');
          } else if (mod?.requestPermissionsAsync) {
            const { status } = await mod.requestPermissionsAsync();
            if (cancelled) return;
            setHasPermission(status === 'granted');
          } else {
            setScannerError('Module scanner indisponible (permissions). Rebuild requis.');
            setHasPermission(false);
          }
        } else {
          setScannerError("Le module 'expo-camera' ne fournit ni CameraView ni BarCodeScanner. Mettez à jour expo-camera.");
          setHasPermission(false);
        }
      } catch (e) {
        console.error('Erreur lors du chargement du scanner:', e);
        setScannerError(
          "Le module de scan n'est pas disponible sur cette build. Sur iOS, installez une Dev Client avec expo-dev-client ou utilisez Expo Go compatible, puis reconstruisez."
        );
        setHasPermission(false);
      }
    };

    loadScanner();

    return () => {
      cancelled = true;
    };
  }, [mode]);

  const handleCreateSession = async () => {
    if (!participantName.trim()) {
      Alert.alert('Erreur', 'Veuillez entrer un nom de joueur');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Simuler la création de session (à remplacer par l'implémentation réelle)
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const info: SessionConnectionInfo = {
        sessionId: `session-${Date.now()}`,
        hostIp: '192.168.1.1', // À récupérer dynamiquement
        hostPort: 8080,
        protocol: 'http',
      };
      
      console.log('Session créée:', info);
      setConnectionInfo(info);
      setIsHost(true); // L'utilisateur est l'hôte
      setIsLoading(false); // Désactiver le loading avant de changer le mode
      setMode('create');
    } catch (error: any) {
      console.error('Error creating session:', error);
      setError(error.message || 'Erreur lors de la création de la session');
      Alert.alert('Erreur', error.message || 'Impossible de créer la session. Vérifiez votre connexion Wi-Fi.');
      setIsLoading(false);
    }
  };

  const handleJoinSession = async (connectionInfo: SessionConnectionInfo) => {
    if (!participantName.trim()) {
      Alert.alert('Erreur', 'Veuillez entrer un nom de joueur');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Simuler la connexion (à remplacer par l'implémentation réelle)
      await new Promise(resolve => setTimeout(resolve, 1000));
      setIsHost(false); // L'utilisateur n'est pas l'hôte
      setMode('session');
      setScanned(false);
      
      if (onSessionReady) {
        onSessionReady();
      }
    } catch (error: any) {
      console.error('Error joining session:', error);
      setError(error.message || 'Erreur lors de la connexion à la session');
      // Afficher l'alerte et ne réactiver le scanner qu'après fermeture par l'utilisateur
      const message = error.message || 'Impossible de rejoindre la session. Vérifiez que vous êtes sur le même réseau Wi-Fi.';
      Alert.alert(
        'Erreur',
        message,
        [
          {
            text: 'OK',
            onPress: () => setScanned(false),
          },
        ],
        {
          cancelable: true,
          // S'assurer que le scanner est réactivé même si l'alerte est rejetée (Android back / tap extérieur)
          onDismiss: () => setScanned(false),
        } as any
      );
  } finally {
      setIsLoading(false);
  }
};

  const handleBarCodeScanned = ({ type, data }: BarCodeScannerResult) => {
    if (scanned) return;
    
    setScanned(true);
    try {
      const info: SessionConnectionInfo = JSON.parse(data);
      if (info.sessionId && info.hostIp && info.hostPort) {
        handleJoinSession(info);
      } else {
        throw new Error('QR code invalide');
      }
    } catch (error) {
      // Pour éviter une boucle d'alertes, on ne réactive le scanner qu'après la fermeture de l'alerte
      Alert.alert(
        'Erreur',
        'QR code invalide. Veuillez scanner un QR code valide.',
        [
          {
            text: 'OK',
            onPress: () => setScanned(false),
          },
        ],
        {
          cancelable: true,
          onDismiss: () => setScanned(false),
        } as any
      );
  }
};

  const handleLeaveSession = () => {
    console.log('handleLeaveSession appelé');
    Alert.alert(
      'Quitter la session',
      'Êtes-vous sûr de vouloir quitter la session ?',
      [
        {
          text: 'Annuler',
          style: 'cancel',
          onPress: () => {
            console.log('Quitter annulé par l\'utilisateur');
          },
        },
        {
          text: 'Quitter',
          style: 'destructive',
          onPress: () => {
            console.log('Confirmation: Quitter la session');
            // Réinitialiser tous les états dans le bon ordre
            setError(null);
            setScanned(false);
            setIsLoading(false);
            setConnectionInfo(null);
            setIsHost(false);
            // Changer le mode en dernier pour déclencher le re-render
            setMode('menu');
            console.log('Session quittée - États réinitialisés');
          },
        },
      ],
      { cancelable: true }
    );
  };

  const handleCancelSession = () => {
    console.log('handleCancelSession appelé - isHost:', isHost, 'connectionInfo:', connectionInfo, 'mode:', mode);

    // Test direct pour vérifier si la fonction est appelée
    try {
      Alert.alert(
        'Annuler la partie',
        'Êtes-vous sûr de vouloir annuler la partie ? Tous les joueurs seront déconnectés.',
        [
          {
            text: 'Annuler',
            style: 'cancel',
            onPress: () => {
              console.log('Annulation annulée par l\'utilisateur');
            },
          },
          {
            text: 'Annuler la partie',
            style: 'destructive',
            onPress: () => {
              console.log('Confirmation: Annulation de la partie - Début de la réinitialisation');
              try {
                // Réinitialiser tous les états dans le bon ordre
                setError(null);
                setScanned(false);
                setIsLoading(false);
                setConnectionInfo(null);
                setIsHost(false);
                // Utiliser setTimeout pour s'assurer que le state est mis à jour
                setTimeout(() => {
                  setMode('menu');
                  console.log('Partie annulée par l\'hôte - Mode changé à menu');
                }, 100);
              } catch (err) {
                console.error('Erreur lors de l\'annulation de la partie:', err);
              }
            },
          },
        ],
        { cancelable: true }
      );
    } catch (error) {
      console.error('Erreur dans handleCancelSession:', error);
      // Fallback: réinitialiser directement si l'Alert échoue
      setError(null);
      setScanned(false);
      setIsLoading(false);
      setConnectionInfo(null);
      setIsHost(false);
      setMode('menu');
    }
  };

  const renderMenu = () => {
    return (
      <View style={styles.menuWrapper}>
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.menuContent}>
              <Text style={styles.title}>Dixit Imagine</Text>
              <Text style={styles.subtitle}>Multijoueur Local</Text>
              
              <View style={styles.nameInputContainer}>
                <Text style={styles.label}>Nom du joueur:</Text>
                <TextInput
                  style={styles.nameInput}
                  value={participantName}
                  onChangeText={setParticipantName}
                  placeholder="Entrez votre nom"
                  placeholderTextColor="#999"
                  autoCapitalize="words"
                  autoCorrect={false}
                />
              </View>

              <TouchableOpacity
                style={[styles.button, styles.createButton, (!participantName.trim() || isLoading) && styles.buttonDisabled]}
                onPress={handleCreateSession}
                disabled={!participantName.trim() || isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text style={styles.buttonText}>Créer une partie</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.button, styles.joinButton, (!participantName.trim() || hasPermission === false || isLoading) && styles.buttonDisabled]}
                onPress={() => setMode('join')}
                disabled={!participantName.trim() || hasPermission === false || isLoading}
              >
                <Text style={styles.buttonText}>Rejoindre une partie</Text>
              </TouchableOpacity>

              {hasPermission === false && (
                <Text style={styles.errorText}>
                  Permission caméra requise pour scanner le QR code
                </Text>
              )}
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    );
  };

  const renderCreateSession = () => {
    console.log('renderCreateSession - isLoading:', isLoading, 'connectionInfo:', connectionInfo, 'mode:', mode);
    
    if (isLoading) {
      return (
        <View style={styles.centerWrapper}>
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color="#FFD700" />
            <Text style={styles.loadingText}>Création de la session...</Text>
          </View>
        </View>
      );
    }

    if (!connectionInfo) {
      return (
        <View style={styles.centerWrapper}>
          <View style={styles.centerContainer}>
            <Text style={styles.errorText}>Erreur: Impossible de créer la session</Text>
            <TouchableOpacity
              style={[styles.button, styles.backButton]}
              onPress={() => setMode('menu')}
            >
              <Text style={styles.buttonText}>Retour au menu</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }

    const qrData = JSON.stringify(connectionInfo);
    console.log('QR Code data:', qrData);

    return (
      <View style={styles.centerWrapper}>
        <ScrollView 
          contentContainerStyle={styles.scrollContentCenter}
          style={styles.fullScreen}
          showsVerticalScrollIndicator={false}
          bounces={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.createContainer}>
            <Text style={styles.sectionTitle}>Partagez ce QR code</Text>
            <Text style={styles.sectionSubtitle}>Les autres joueurs peuvent le scanner pour rejoindre</Text>
            
            <View style={styles.qrContainer}>
              {qrData ? (
                <QRCode
                  value={qrData}
                  size={250}
                  backgroundColor="white"
                  color="black"
                />
              ) : (
                <ActivityIndicator size="large" color="#FFD700" />
              )}
            </View>

            <View style={styles.infoContainer}>
              <Text style={styles.infoText}>Session ID: {connectionInfo.sessionId}</Text>
              <Text style={styles.infoText}>Adresse: {connectionInfo.hostIp}:{connectionInfo.hostPort}</Text>
            </View>

            <View style={styles.createActions}>
              <TouchableOpacity
                style={[styles.button, styles.playButton]}
                onPress={() => {
                  console.log('Bouton "Commencer à jouer" pressé');
                  if (onSessionReady) {
                    onSessionReady();
                  } else {
                    setMode('session');
                  }
                }}
                activeOpacity={0.7}
              >
                <Text style={styles.buttonText}>Commencer à jouer</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.backButton]}
                onPress={() => {
                  console.log('Bouton "Voir la session" pressé');
                  setMode('session');
                }}
                activeOpacity={0.7}
              >
                <Text style={styles.buttonText}>Voir la session</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton, isLoading && styles.buttonDisabled]}
                onPress={() => {
                  console.log('Bouton "Annuler la partie" pressé depuis renderCreateSession');
                  if (!isLoading) {
                    handleCancelSession();
                  } else {
                    console.log('Bouton désactivé car isLoading est true');
                  }
                }}
                activeOpacity={0.7}
                disabled={isLoading}
              >
                <Text style={styles.buttonText}>Annuler la partie</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </View>
    );
  };

  const renderJoinSession = () => {
    if (scannerError) {
      return (
        <View style={styles.centerWrapper}>
          <View style={styles.centerContainer}>
            <Text style={styles.errorText}>{scannerError}</Text>
            <TouchableOpacity style={[styles.button, styles.backButton]} onPress={() => setMode('menu')}>
              <Text style={styles.buttonText}>Retour</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }

    if (hasPermission === null || !Scanner) {
      return (
        <View style={styles.centerWrapper}>
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color="#FFD700" />
            <Text style={styles.loadingText}>Initialisation du scanner...</Text>
            <TouchableOpacity style={[styles.button, styles.backButton]} onPress={() => setMode('menu')}>
              <Text style={styles.buttonText}>Annuler</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }

    if (hasPermission === false) {
      return (
        <View style={styles.centerWrapper}>
          <View style={styles.centerContainer}>
            <Text style={styles.errorText}>Permission caméra requise</Text>
            <TouchableOpacity
              style={[styles.button, styles.backButton]}
              onPress={() => setMode('menu')}
            >
              <Text style={styles.buttonText}>Retour</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }

    const ScannerComp = Scanner;

    return (
      <View style={styles.scannerContainer}>
        {scannerKind === 'cameraview' ? (
          <ScannerComp
            style={StyleSheet.absoluteFillObject}
            facing="back"
            barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
            onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
          />
        ) : (
          <ScannerComp
            style={StyleSheet.absoluteFillObject}
            onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
          />
        )}
        <View style={styles.scannerOverlay}>
          <View style={styles.scannerFrame} />
          <Text style={styles.scannerText}>Scannez le QR code pour rejoindre</Text>
          <TouchableOpacity
            style={[styles.button, styles.backButton]}
            onPress={() => {
              setMode('menu');
              setScanned(false);
            }}
          >
            <Text style={styles.buttonText}>Retour</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderSession = () => {
    return (
      <View style={styles.centerWrapper}>
        <View style={styles.centerContainer}>
          <Text style={styles.title}>Session active</Text>
          <Text style={styles.subtitle}>Bienvenue {participantName}!</Text>
          {isHost && (
            <View style={styles.hostBadgeContainer}>
              <View style={styles.hostBadge}>
                <Text style={styles.hostBadgeText}>Vous êtes l'hôte</Text>
              </View>
            </View>
          )}
          <TouchableOpacity
            style={[styles.button, styles.playButton]}
            onPress={() => {
              if (onSessionReady) {
                onSessionReady();
              }
            }}
          >
            <Text style={styles.buttonText}>Commencer à jouer</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, isHost ? styles.cancelButton : styles.leaveButton]}
            onPress={() => {
              console.log('Bouton pressé dans renderSession - isHost:', isHost);
              if (isHost) {
                console.log('Appel de handleCancelSession depuis renderSession');
                handleCancelSession();
              } else {
                console.log('Appel de handleLeaveSession depuis renderSession');
                handleLeaveSession();
              }
            }}
            activeOpacity={0.7}
          >
            <Text style={styles.buttonText}>
              {isHost ? 'Annuler la partie' : 'Quitter la session'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  console.log('SessionScreen render - mode:', mode, 'connectionInfo:', connectionInfo, 'isLoading:', isLoading);

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <SkyBackground fullScreen />
      
      {error && (
        <View style={styles.errorBanner}>
          <Text style={styles.errorBannerText}>{error}</Text>
        </View>
      )}

      {mode === 'menu' && renderMenu()}
      {mode === 'create' && renderCreateSession()}
      {mode === 'join' && renderJoinSession()}
      {mode === 'session' && renderSession()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  menuWrapper: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  keyboardView: {
    flex: 1,
    width: '100%',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  scrollContentCenter: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    minHeight: '100%',
  },
  centerWrapper: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullScreen: {
    flex: 1,
  },
  menuContent: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 20,
    padding: 30,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
    alignItems: 'center',
  },
  centerContainer: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 20,
    padding: 30,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    color: '#666',
    marginBottom: 40,
    textAlign: 'center',
  },
  nameInputContainer: {
    width: '100%',
    marginBottom: 30,
  },
  label: {
    fontSize: 16,
    color: '#333',
    marginBottom: 8,
    fontWeight: '500',
  },
  nameInput: {
    borderWidth: 2,
    borderColor: '#FFD700',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: 'white',
    color: '#333',
  },
  button: {
    padding: 15,
    borderRadius: 8,
    marginVertical: 8,
    minWidth: 200,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 50,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  createButton: {
    backgroundColor: '#FFD700',
  },
  joinButton: {
    backgroundColor: '#4CAF50',
  },
  backButton: {
    backgroundColor: '#666',
  },
  playButton: {
    backgroundColor: '#4CAF50',
  },
  leaveButton: {
    backgroundColor: '#f44336',
  },
  cancelButton: {
    backgroundColor: '#f44336',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  hostBadgeContainer: {
    marginBottom: 20,
    marginTop: -10,
  },
  hostBadge: {
    backgroundColor: '#FFD700',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hostBadgeText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  createContainer: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 20,
    padding: 30,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
    alignItems: 'center',
    marginVertical: 20,
    maxHeight: '90%',
  },
  qrScrollView: {
    maxHeight: 400,
    width: '100%',
  },
  qrContainer: {
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 12,
    marginVertical: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoContainer: {
    marginVertical: 20,
    alignItems: 'center',
    width: '100%',
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    marginVertical: 5,
    textAlign: 'center',
  },
  createActions: {
    width: '100%',
    marginTop: 20,
  },
  scannerContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  scannerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scannerFrame: {
    width: 250,
    height: 250,
    borderWidth: 2,
    borderColor: '#FFD700',
    borderRadius: 12,
  },
  scannerText: {
    color: 'white',
    fontSize: 16,
    marginTop: 20,
    marginBottom: 20,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
    textAlign: 'center',
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
    textAlign: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: '#333',
    fontSize: 16,
    textAlign: 'center',
  },
  errorText: {
    color: '#f44336',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 10,
  },
  errorBanner: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: '#f44336',
    padding: 10,
    zIndex: 1001,
  },
  errorBannerText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 14,
  },
});
