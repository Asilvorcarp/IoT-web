import React from 'react';
import Head from 'next/head'
import Image from 'next/image'

import mqtt from 'mqtt';

let that = null;

export default class Home extends React.Component {
// ProductKey
// gw84Eq8aXxj
// DeviceName
// bigWeb
// DeviceSecret
// ddb8b67c0651a41e426a5f57551dbad9

    constructor(props) {
        super(props);
        
        this.state = {
            temperature: "",
            PhotoResistors: "",
            level: "",
            smoke: "",
        }

        this.data = {
            client: null, 
            reconnectCounts: 0, //记录重连的次数

            host: 'ws://gw84Eq8aXxj.iot-as-mqtt.cn-shanghai.aliyuncs.com:443', // !! custom
            options: {
                protocolVersion: 4, //MQTT连接协议版本
                clean: false,
                reconnectPeriod: 60 * 1000, //自己进行重新连接的时间间隔：一分钟
                connectTimeout: 60 * 1000, //过期用时：一分钟
                resubscribe: true, //如果连接断开并重新连接，则会再次自动订阅已订阅的主题（默认true）
                clientId: 'bigWeb|securemode=3,signmethod=hmacsha1,timestamp=998|', // !! custom
                password: 'EDAF5718CE7D87BCB0AB85EF3DEBBE84F357DE01', // !! custom
                username: 'bigWeb&gw84Eq8aXxj', // !! custom
            },

            aliyunInfo: {
                // productKey: 'gw8bj30DgHV', //阿里云连接的三元组 ，请自己替代为自己的产品信息!!
                // deviceName: 'WechatControler', //阿里云连接的三元组 ，请自己替代为自己的产品信息!!
                // deviceSecret: '4af5058851cf38d5a153537f0691a948', //阿里云连接的三元组 ，请自己替代为自己的产品信息!!
                // regionId: 'cn-shanghai', //阿里云连接的三元组 ，请自己替代为自己的产品信息!!
                pubTopic: '/gw84Eq8aXxj/bigWeb/user/webToAr', //发布消息的主题 // !! custom
                subTopic: '/gw84Eq8aXxj/bigWeb/user/arToWeb', //订阅消息的主题 // !! custom
            },
        }
    }

    componentDidMount() {
        that = this

        console.log("this.data.options host:" + this.data.host);
        console.log("this.data.options data:" + JSON.stringify(this.data.options));

        //访问服务器
        this.data.client = mqtt.connect(this.data.host, this.data.options);

        this.data.client.on('connect', function (connack) {
            console.log("connect success");
        });
        
        this.data.client.on('message', (topic, payload)=>{
            console.log(" 收到 topic:" + topic + " , payload :" + payload);
            // console.log(JSON.parse(payload).params.PhotoResistors)
            this.setState({
                // PhotoResistors: JSON.parse(payload).params.PhotoResistors,

                PhotoResistors: JSON.parse(payload).items.PhotoResistors.value,
                temperature: JSON.parse(payload).items.RoomTemp.value,
                smoke: JSON.parse(payload).checkFailedData.smoke.value,
                level: JSON.parse(payload).checkFailedData.level.value,
            })
        });

        this.data.client.on('error', function (err) {
            console.log("error: " + err);
        });

        this.data.client.on('close', function () {
            console.log("close");
        });

        this.data.client.on('offline', function () {
            console.log("offline");
        });

        this.data.client.on('reconnect', function () {
            console.log("reconnect");
        });

        this.data.client.on('end', function () {
            console.log("end");
        });
    }

    componentWillUnmount() {}

    // methods:

    sendCommond(isOpenData) {
        let sendData = {
            id: '12233443',
            version: '1.0',
            params:{
                isOpen: isOpenData,
                set:1
            }
        }
        this.data.client.subscribe(this.data.aliyunInfo.subTopic,function(err){
            if(!err){
                console.log("订阅成功");
            };
        })  

          //发布消息
          if (this.data.client && this.data.client.connected) {
            this.data.client.publish(this.data.aliyunInfo.pubTopic, JSON.stringify(sendData));
            console.log("************************")
            console.log(this.data.aliyunInfo.pubTopic)
            console.log(JSON.stringify(sendData))
          } else {
            console.log(this.data.client)
            console.log(this.data.client.connected)
            console.log('请先连接服务器');
          }
    }

    onClickOpen() {
        
        that.sendCommond(1);
        alert("已开启")
    }

    onClickOff() {
        that.sendCommond(0);
        alert("已关闭")
    }

    // render:

    render() {
        return ( 
            <>
                <div className="card" style={{marginTop: 10}}>
                    <p className="price"> 火灾报警器！ </p> 
                </div>
                
                <div className="card">
                    <p className="pp"> 当前温度：{this.state.temperature}℃</p>
                    <p className="pp"> 当前光线强度：{this.state.PhotoResistors} </p>
                    <p className="pp"> 当前烟雾指数：{this.state.smoke} </p>
                    <p className="pp"> 当前火灾预警级别：{this.state.level} </p>
                    <p className="pp"> <br></br> </p>

                    <div style={{flex:"1 1 1"}}>
                        <button className="button" onClick={this.onClickOpen}>
                            <span className="label">开启警报器</span>
                        </button>
                        <button className="button" onClick={this.onClickOff}>
                            <span className="label">关闭警报器</span>
                        </button>
                    </div>
                    
                </div>

                <div className="card" style={{position:"sticky"}}>
                    <div >
                        <p> 当前连接参数： </p>
                        <p> clientId: {this.data.options.clientId}</p>
                        <p> password: {this.data.options.password} </p>
                        <p> username: {this.data.options.username} </p>
                        <p> pubTopic: {this.data.aliyunInfo.pubTopic} </p>
                        <p> subTopic: {this.data.aliyunInfo.subTopic} </p>
                    </div>
                </div>
            </>
        );
    }
}
