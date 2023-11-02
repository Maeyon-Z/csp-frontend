<template>
    <div style="margin-top:20px; margin-left:20px; margin-right:10px">
        <el-card class="box-card">
            <template #header>
                <el-row>
                     <span style="font-size:40px">{{ paperInfo.paperName }} </span>
                </el-row>
            </template>
            <el-row style="margin-bottom:10px"> <span style="font-size:15px">{{ paperInfo.remark }} </span> </el-row>
            <el-row> <span style="font-size:15px">{{ "生成时间：" +  paperInfo.createTime }} </span> </el-row> 
            <el-divider />
            <el-tabs type="border-card">
                <el-tab-pane label="基础题">
                    <BaseInfo :paperId="paperId" />
                </el-tab-pane>
                <el-tab-pane label="阅读程序题">
                    <ProgramInfo :type="1" :paperId="paperId"/>
                </el-tab-pane>
                <el-tab-pane label="补全程序题">
                    <ProgramInfo :type="2" :paperId="paperId"/>
                </el-tab-pane>
            </el-tabs>
        </el-card>

    </div>
</template>

<script setup name="InfoPaper">
import { useRoute } from "vue-router"
import { getPaper } from "@/api/dataControl/paper";
import BaseInfo from './components/BaseInfo.vue';
import ProgramInfo from './components/ProgramInfo.vue';
const route = useRoute();
const paperId = route.params.paperId;

const data = reactive({
  paperInfo: {},
  
});
const { paperInfo } = toRefs(data);


onMounted(() => {
    getPaper(paperId).then(res => {
        if(res.code === 200){
            paperInfo.value = res.data;
        }
    })
})

</script>