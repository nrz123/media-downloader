import React from 'react'
import { Input, message} from 'antd'
const { Search } = Input
const {ipcRenderer}=window.require('electron')
class MainPage extends React.Component {
    constructor(props) {
        super(props)
    }
    render(){
        return(
            <div style={{width:'100%',height:'100%',position: 'relative'}}>
                <Search
                    placeholder="输入网址"
                    allowClear
                    enterButton="打开网页"
                    size="large"
                    style={{
                        position:'absolute',
                        left:'50%',
                        transform: 'translateX(-50%)',
                        width:'600px',
                        top:'200px'
                    }}
                    onSearch={value=>value?ipcRenderer.send('web',value):message.info('网址不能为空')}
                />
            </div>
        )
    }
}
export default MainPage