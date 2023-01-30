import {useState} from 'react';
import {PermissionsAndroid, Platform} from 'react-native';
import {BleManager} from 'react-native-ble-plx';
import DeviceInfo from 'react-native-device-info';

type PermissionCallback = (result:boolean) => void;

const bleManager = new BleManager();

interface BluetoothLowEnergyApi {
    requestPermissions(callback: PermissionCallback):Promise<void>;
    connectToDevice(device:Device): Promise<void>;
    scanForDevices(): void;
    allDevices:Device[];
}

export default function useBLE(): BluetoothLowEnergyApi{
    const [allDevices,setAllDevices] = useState<Device[]>([]);
    const [device,setConnectedDevice]=useState<Device | null>(null);
    const requestPermissions= async(callback:PermissionCallback)=>{
        if(Platform.OS === 'android') {
            const apiLevel= await DeviceInfo.getApiLevel();
            if(apiLevel < 31>){
                const grantedStatus = await PermissionsAndroid.request(
                PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
                {
                title:'Location Permission',
                message:'Bluetooth Low Energy Needs Location Permission',
                buttonNegative:'Cancel',
                buttonPositive:'ok',
                buttonNeutral:'Maybe Later',
                },
            );
            callback(grantedStatus === PermissionsAndroid.RESULTS.GRANTED);
            }
            else{
                const result = await requestMultiple([
                    PERMISSIONS.ANDROID.BLUETOOTH_SCAN,
                    PERMISSIONS.ANDROID.BLUETOOTH_CONNECT,
                    PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION,
                ]);

                const isAllPermissionsGranted=
                    result['android.permission.BLUETOOTH_SCAN'] ===
                        PermissionsAndroid.RESULTS.GRANTED &&
                    result['android.permission.BLUETOOTH_CONNECT'] ===
                        PermissionsAndroid.RESULTS.GRANTED &&
                    result['android.permission.ACCESS_FINE_LOCATION'] ===
                        PermissionsAndroid.RESULTS.GRANTED;
                callback(isAllPermissionsGranted);
            }
        }
        else{
            callback(true);
        }
    };
    const isDuplicateDevice=(devices:Device[],nextDevice:Device)=>{
        devices.findIndex(device => nextDevice.id === device.id) >-1;
    }
    const scanForDevices=()=>{
        bleManager.startDeviceScan(null,null,(error,device)=>{
            if(error){
                console.log(error);
            }
            if (device && device.name?.includes('Airdopes')){
                //Add device
                setAllDevices((prevState)=>{
                    if(!isDuplicateDevice(prevState,device)){
                        return[...prevState,device];
                    }
                    return prevState;
                });
            }
        });
    };
    const connectToDevice =async(device:Device)=>{
    try{
        const deviceConnection = await bleManager.connectToDevice(device.id);
        setConnectedDevice(deviceConnection);
        bleManager.stopDeviceScan();
    }
    catch(e){
        console.log('Error when connecting',e);
    }
    };
    const startStreamingData = async(device:Device)=>{
        if(device){
            device.monitorCharacteristicForService('','',() =>{});
        }
        else{
            console.error('No device connected');
        }
    };
    return{
        requestPermissions,
        scanForDevices,
        allDevices,
        connectToDevice,
    };
}