<template>
  <el-container>
    <el-aside>
      <el-menu :default-active="1">
        <el-menu-item index="1" @click="activeIndex=1">员工信息上传</el-menu-item>
        <el-menu-item index="2" @click="activeIndex=2">邮件模板设置</el-menu-item>
        <!-- <el-menu-item index="3">选项3</el-menu-item> -->
      </el-menu>
    </el-aside>
    <!-- excel上传 -->
    <el-main v-show="activeIndex === 1">
      <!-- 引导语 -->
      <p>hello</p>
      <p>欢迎使用世纪鲲鹏邮件系统，请先上传生日excel和员工司龄excel</p>
      <p>默认邮件模板为一张背景图，请务必先修改模板再生成邮件草稿，否则会生成默认格式的邮件</p>
      <el-upload
        class="upload-demo"
        accept=".xls, .xlsx" 
        action="http://carry666.com:3000/uploadBirthDayExcel"
      >
        <el-button size="small" type="primary" icon="el-icon-edit">员工生日信息</el-button>
      </el-upload>
      <el-upload
        class="upload-demo"
        accept=".xls, .xlsx" 
        action="http://carry666.com:3000/uploadAgeExcel"
      >
        <el-button size="small" type="primary" icon="el-icon-edit">员工司龄信息</el-button>
      </el-upload>
      <el-button-group>
        <el-button type="primary" palin round @click="testSendMail(true)">生成生日邮件草稿</el-button>
        <el-button type="primary" palin round @click="testSendMail">生成司龄邮件草稿</el-button>
      </el-button-group>
    </el-main>
    <!-- email template -->
    <el-main v-show="activeIndex === 2">
      <div class="temp_container" v-for="(item, index) in templateList" :key="index" @click="editTemplate(item)">
        {{item.name}}
      </div>
    </el-main>
    <el-dialog
      title="编辑模板"
      v-model="dialogVisible"
      width="80%"
      :before-close="handleClose">
      <el-row :gutter="20">
        <!-- 上传背景图片，设置用户名位置和内容 -->
        <el-col :span="12">
          <el-form ref="form" :model="editTemp" label-width="150px">
            <span>上传模板背景图片</span><input type="file" accept="image/jpeg,image/gif,image/png" id="file" @change="handleAvatarSuccess">
            <el-form-item label="收件人位置调整 %">
              <el-input type="number" v-model="editTemp.nameLeft"></el-input>
              <el-input type="number" v-model="editTemp.nameTop"></el-input>
            </el-form-item>
          </el-form>
        </el-col>
        <!-- 预览邮件 -->
        <el-col :span="12">
          <div v-html="editTemp.htmlStr"></div>
          <div id="email" :style="{position: 'relative',backgroundSize: '100% auto', backgroundRepeat: 'no-repeat',backgroundImage:'url(' + editTemp.imageUrl+')', minHeight: '300px', width: 'auto'}">
            <p :style="{position: 'absolute', color: '#fff', left: editTemp.nameLeft + '%', top: editTemp.nameTop + '%'}">收件人名称</p>
          </div>
        </el-col>
      </el-row>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="setTemplate">确 定</el-button>
        </span>
      </template>
    </el-dialog>
  </el-container>
</template>

<script>
import { ref } from "vue";
// import HelloWorld from './components/HelloWorld.vue'
import axios from 'axios';
import { ElMessage } from 'element-plus'
// import FileReader from 'filereader'

export default {
  name: 'App',
  components: {
    // HelloWorld
  },
  setup() {
    // // 解析excel文件
    // const handleExcelSuccess = () => {
    //   // 员工信息存储
    // }
    // 设置当前内容
    let activeIndex = ref(1)
    // 设置邮件模板
    let dialogVisible = ref(false)
    let editTemp = ref({})
    const editTemplate = (item) => {
      if (!item.id) {
        return
      }
      dialogVisible.value = !dialogVisible.value
      editTemp.value = item
    }
    const setTemplate = () => {
      dialogVisible.value = false
      // 设置模板字符串
      editTemp.value.htmlStr = document.getElementById('email').innerHTML;
      // 发送修改模板的请求
      axios.post('http://carry666.com:3000/saveTemplate', editTemp.value)
        .then(() => {
          ElMessage.success({
            message: '模板设置成功',
            type: 'success'
          });
          // 重新获取模板
          getTemplateList()
        })
        .catch((e) => {
          console.log(e)
        })
      editTemp.value = {}
    }
    // 上传背景图片成功
    const handleAvatarSuccess = () => {
      let reads= new FileReader();
      let f=document.getElementById('file').files[0];
      reads.readAsDataURL(f);
      reads.onload=function () {
        editTemp.value.imageUrl = reads.result
      };
    }
    let templateList = ref([])
    // 获取模板历史
    const getTemplateList = function() {
      axios.get('http://carry666.com:3000/getTemplateList')
        .then(resp => {
          templateList.value = resp.data.list
        })
        .catch(e => {
          console.log(e)
        })
    }
    getTemplateList()
    // 获取当前用户身份，通讯录信息
    // 发送邮件
    const testSendMail = (isBirth='') => {
      axios.get(`http://carry666.com:3000/send?isBirth=${isBirth}`)
        .then(({data}) => {
          const {errCode, errmsg} = data
          if (errCode === 0) {
            ElMessage.success({
              message: '草稿设置成功，请稍后到测试邮箱草稿箱查看（耗时约10min）',
              type: 'success'
            });
          } else {
            ElMessage.error({
              message: errmsg
            });
          }
          
        })
        .catch(e => {
          console.log(e)
        })
    }
    return {
      activeIndex,
      dialogVisible,
      editTemp,
      editTemplate,
      setTemplate,
      templateList,
      handleAvatarSuccess,
      // handleExcelSuccess,
      testSendMail,
    }
  }
}
</script>

<style scoped>
.temp_container {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 50px;
  line-height: 50px;
  border: 1px solid #333;
  margin-bottom: 20px;
}
.el-menu{
  height: 100%;
}
.el-button {
  margin-top: 20px;
}
</style>
