<template>
    <div class="app-container">
      <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
            <el-form-item label="考试名称" prop="examName">
              <el-input v-model="queryParams.examName" placeholder="请输入考试名称" @keyup.enter="handleQuery" />
            </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
          <el-button icon="Refresh" @click="resetQuery">重置</el-button>
        </el-form-item>
      </el-form>
  
      <el-table v-loading="loading" :data="examList" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" align="center" />
                <el-table-column type="index" label="序号" align="center" width="50" />
                <el-table-column label="考试名称" align="center" prop="examName" />
                <el-table-column label="试卷名称" align="center" prop="paperName" />
                <el-table-column label="持续时间" align="center" prop="duration" >
                  <template #default="scope">
                    <span>{{ scope.row.duration + "分钟" }}</span>
                  </template>
                </el-table-column>
                <el-table-column label="参与用户" align="center" prop="users" >
                  <template #default="scope">
                    <el-tag v-for="userId in scope.row.users" class="ml-2" style="margin:3px">
                      {{ getUserNameById(userId) }}
                    </el-tag>
                  </template>
                </el-table-column>
                <el-table-column label="考试状态" align="center" prop="status" >
                  <template #default="scope">
                    <dict-tag :options="exam_status" :value="scope.row.status"/>
                  </template>
                </el-table-column>
                <el-table-column label="考试发布时间" align="center" prop="createTime" width="180"/>
                <el-table-column label="开始时间" align="center" prop="startTime" width="180"/>
                <el-table-column label="结束时间" align="center" prop="endTime" width="180"/>
                <el-table-column label="分数" align="center" prop="score" width="180"/>
                <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
                  <template #default="scope">
                    <el-button v-show="scope.row.status === 0" link type="primary" @click="handleStartExam(scope.row)">开始考试</el-button>
                    <el-button v-show="scope.row.status === 1" link type="primary" @click="handleBackExam(scope.row)">回到考试</el-button>
                    <!-- <el-button v-show="scope.row.status === 2" link type="primary" icon="Search" @click="handleReviewExam(scope.row)">考试回顾</el-button> -->
                    <el-button v-show="scope.row.status === 2" link type="primary" icon="Search" @click="handleShowRank(scope.row)">成绩排名</el-button>
                  </template>
                </el-table-column>
      </el-table>
  
      <pagination
          v-show="total>0"
          :total="total"
          v-model:page="queryParams.pageNum"
          v-model:limit="queryParams.pageSize"
          @pagination="getList"
      />

      <el-dialog title="成绩排名" v-model="showRank" width="1020px" append-to-body>
        <el-table v-loading="loadingRank" :data="rankList">
            <el-table-column type="index" label="排名" align="center" width="50" />
            <el-table-column label="分数" align="center" prop="score" />
            <el-table-column label="姓名" align="center" prop="userId" >
              <template #default="scope">
                  {{ getUserNameById(scope.row.userId) }}
              </template>
            </el-table-column>
            <el-table-column label="考试状态" align="center" prop="status" >
              <template #default="scope">
                <dict-tag :options="exam_status" :value="scope.row.status"/>
              </template>
            </el-table-column>
        </el-table>
      </el-dialog>
    </div>
  </template>
  
  <script setup name="Exam">
    import { listExam, getAllUser, startExam, getRank } from "@/api/stu/exam";
    import { getPaperListForExam } from "@/api/stu/paper";
    import { useRouter } from 'vue-router';

    const router = useRouter();
    const { proxy } = getCurrentInstance();
    const { exam_status } = proxy.useDict("exam_status");
    const examList = ref([]);
    const loading = ref(true);
    const showSearch = ref(true);
    const ids = ref([]);
    const single = ref(true);
    const multiple = ref(true);
    const total = ref(0);
    const title = ref("");
  
    const data = reactive({
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        examName: null,
      },
      paperList:[],
      userList:[],
      showRank: false, loadingRank: false, rankList:[]
    });
  
    const { queryParams, paperList, userList, showRank, loadingRank, rankList } = toRefs(data);
    
    const handleStartExam = (row) => {
      proxy.$modal.confirm('考试时长' + row.duration + '分钟，是否开始考试?').then(function() {
        return startExam(row);
      }).then(() => {
        getList();
        proxy.$modal.msgSuccess("成功开始考试");
        router.push('/stu/exam-info/exam/' + row.id + '/' + row.paperId)
      }).catch(() => {});
    }

    const handleBackExam = (row) => {
      router.push('/stu/exam-info/exam/' + row.id + '/' + row.paperId)
    }

    const handleReviewExam = (row) => {

    }

    const handleShowRank = (row) => {
      loadingRank.value = true;
      getRank(row.examId).then(res => {
        if(res.code === 200){
          rankList.value = res.data;
        }
      })
      showRank.value = true;
      loadingRank.value = false;
    }

    onMounted(() => {
      getPaperList();
      getList();
      getUserList();
    })
  
    const getPaperList = () =>{
      getPaperListForExam().then(res => {
        if(res.code === 200){
          paperList.value = res.data;
        }
      })
    }
  
    const getUserList = () =>{
      getAllUser().then(res => {
        if(res.code === 200){
          userList.value = res.data;
        }
      })
    }
  
    function getUserNameById(userId){
      const user = userList.value.find(ele => ele.userId === userId)
      return user.nickName;
    }
  
    /** 查询考试管理列表 */
    function getList() {
      loading.value = true;
      listExam(queryParams.value).then(response => {
        examList.value = response.rows;
        examList.value.forEach(ele => {
          const paper = paperList.value.find(p => p.id === ele.paperId);
          ele.paperName = paper.paperName;
        })
        total.value = response.total;
        loading.value = false;
      });
    }
  
    /** 搜索按钮操作 */
    function handleQuery() {
      queryParams.value.pageNum = 1;
      getList();
    }
  
    /** 重置按钮操作 */
    function resetQuery() {
      proxy.resetForm("queryRef");
      handleQuery();
    }
  
    // 多选框选中数据
    function handleSelectionChange(selection) {
      ids.value = selection.map(item => item.id);
      single.value = selection.length != 1;
      multiple.value = !selection.length;
    }
  </script>
  