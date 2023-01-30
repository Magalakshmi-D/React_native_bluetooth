import React,{useState} from 'react';
import {SafeAreaView,Text,View,StyleSheet,TouchableOpacity} from 'react-native';
import DeviceModal from './DeviceConnectionModal';
import useBLE from './useBLE';

const App=()=>{
    const [isModalVisible,setIsModalVisible]=useState<boolean>(false);
    const {requestPermissions,scanForDevices,allDevices,connectToDevice}=useBLE();
    const hideModal =() =>{
        setIsModalVisible(false);
    };
    const openModal =async()=>{
        requestPermissions((isGranted:boolean)=>{
            alert('The Android Permission is Granted?' + isGranted);
            if(isGranted){
                scanForDevices();
                console.log('Granted....');
                setIsModalVisible(true);
            }
        });
    };

    return(
    <SafeAreaView style={styles.container}>
        <View style={styles.heartRateTitleWrapper}>
            <Text style={styles.heartRateTitleText}>
                Please Connect to a Heart Rate
            </Text>
            {allDevices.map((device:Device)=>(
                <Text>{device.name}</Text>
            ))}
        </View>
        <TouchableOpacity onPress={openModal} style={styles.ctaButton}>
            <Text style={styles.ctaButtonText}>{'Connect'}</Text>
        </TouchableOpacity>
        <DeviceModal
            closeModal={hideModal}
            visible={isModalVisible}
            connectToPeripheral={connectToDevice}
            devices={[allDevices]}
        />
    </SafeAreaView>
    );
};


const styles=StyleSheet.create({
    container:{
        backgroundColor:'#f2f2f2',
        flex:1,
    },
    heartRateTitleWrapper:{
        flex:1,
        justifyContent:'center',
        alignItems:'center',
    },
    heartRateTitleText:{
        fontSize:30,
        fontWeight:'bold',
        textAlign:'center',
        marginHorizontal:20,
        color:'black',
    },
    heartRateText:{
        fontSize:25,
        marginTop:15,
    },
    ctaButton:{
        backgroundColor:'purple',
    },
    ctaButtonText:{
        fontSize:25,
        fontWeight:'bold',
        textAlign:'center',
        color:'white',
    }
})
export default App;
