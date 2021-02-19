<template>
  <el-container>
    <el-aside>
      <el-menu :default-openeds="['1']">
        <el-menu-item index="1">邮件模板设置</el-menu-item>
        <el-menu-item index="2">员工信息上传</el-menu-item>
        <!-- <el-menu-item index="3">选项3</el-menu-item> -->
      </el-menu>
    </el-aside>
    <el-main>
      <!-- email template -->
      <div class="temp_container" v-for="(item, index) in templateList" :key="index" @click="editTemplate(item)">
        {{item.name}}
      </div>
      <!-- excel上传 -->
      <el-upload
        class="upload-demo"
        action="http://carry666.com:3000/uploadBirthDayExcel"
      >
        <el-button size="small" type="primary">+员工生日信息</el-button>
      </el-upload>
      <el-upload
        class="upload-demo"
        action="http://carry666.com:3000/uploadAgeExcel"
      >
        <el-button size="small" type="primary">+员工司龄信息</el-button>
      </el-upload>
      <el-button size="small" type="primary" @click="testSendMail(true)">生成生日邮件草稿</el-button>
      <el-button size="small" type="primary" @click="testSendMail">生成司龄邮件草稿</el-button>
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
            <span>上传模板背景图片</span><input type="file" id="file" @change="handleAvatarSuccess">
            <el-form-item label="收件人位置调整 %">
              <el-input type="number" v-model="editTemp.nameLeft"></el-input>
              <el-input type="number" v-model="editTemp.nameTop"></el-input>
            </el-form-item>
          </el-form>
        </el-col>
        <!-- 预览邮件 -->
        <el-col :span="12">
          <div v-html="editTemp.htmlStr"></div>
          <div id="email" :style="{position: 'relative',backgroundSize: '100% auto', backgroundRepeat: 'no-repeat',backgroundImage:'url(' + editTemp.imageUrl+')', minHeight: '100%', width: 'auto'}">
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
    // 解析excel文件
    const handleExcelSuccess = () => {
      // 员工信息存储
    }
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
      dialogVisible,
      editTemp,
      editTemplate,
      setTemplate,
      templateList,
      handleAvatarSuccess,
      handleExcelSuccess,
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
</style>
