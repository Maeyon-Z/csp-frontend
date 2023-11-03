<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
          <el-form-item label="考试名称" prop="examName">
            <el-input v-model="queryParams.examName" placeholder="请输入考试名称" @keyup.enter="handleQuery" />
          </el-form-item>
      <el-form-item>
        <el-button type="primary" plain icon="Plus" @click="handleAdd" v-hasPermi="['dataControl:exam:add']">新增</el-button>
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
              <el-table-column label="创建时间" align="center" prop="createTime" width="180"/>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template #default="scope">
          <!-- <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['dataControl:exam:edit']">修改</el-button> -->
          <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['dataControl:exam:remove']">删除</el-button>
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

    <!-- 添加或修改考试管理对话框 -->
    <el-dialog :title="title" v-model="open" width="500px" append-to-body>
      <el-form ref="examRef" :model="form" :rules="rules" label-width="80px">
          <el-form-item label="考试名称" prop="examName">
            <el-input v-model="form.examName" placeholder="请输入考试名称" />
          </el-form-item> 
          <el-form-item label="考试试卷" prop="paperId">
            <el-select style="width:400px" v-model="form.paperId" filterable placeholder="请选择试卷">
              <el-option
                v-for="item in paperList"
                :key="item.id"
                :label="item.paperName"
                :value="item.id"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="参与用户" prop="users">
            <el-select style="width:400px" v-model="form.users" filterable multiple placeholder="请选择参与用户">
              <el-option
                v-for="item in userList"
                :key="item.userId"
                :label="item.nickName"
                :value="item.userId"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="持续时间" prop="duration">
            <el-input-number style="width:200px" :min="1" :max="300" v-model="form.duration" placeholder="请输入持续时间" />
          </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitForm">确 定</el-button>
          <el-button @click="cancel">取 消</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="Exam">
  import { listExam, getExam, delExam, addExam, updateExam, getAllUser } from "@/api/dataControl/exam";
  import { getPaperListForExam } from "@/api/dataControl/paper";

  const { proxy } = getCurrentInstance();

  const examList = ref([]);
  const open = ref(false);
  const loading = ref(true);
  const showSearch = ref(true);
  const ids = ref([]);
  const single = ref(true);
  const multiple = ref(true);
  const total = ref(0);
  const title = ref("");

  const data = reactive({
    form: {},
    queryParams: {
      pageNum: 1,
      pageSize: 10,
      examName: null,
    },
    rules: {
        examName: [
          { required: true, message: "考试名称不能为空", trigger: "blur" }
        ],
        paperId: [
          { required: true, message: "试卷id不能为空", trigger: "blur" }
        ],
        paperName: [
          { required: true, message: "试卷名称不能为空", trigger: "blur" }
        ],
        duration: [
          { required: true, message: "持续时间不能为空", trigger: "blur" }
        ],
        users: [
          { required: true, message: "请选择参与考试的用户", trigger: "blur" }
        ],
    },
    paperList:[],
    userList:[]
  });

  const { queryParams, form, rules, paperList, userList } = toRefs(data);

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

  // 取消按钮
  function cancel() {
    open.value = false;
    reset();
  }

  // 表单重置
  function reset() {
    form.value = {
      id: null,
      examName: null,
      paperId: null,
      paperName: null,
      duration: null,
      isDelete: null,
      createBy: null,
      createTime: null,
      updateBy: null,
      updateTime: null,
      users: []
    };
    proxy.resetForm("examRef");
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

  /** 新增按钮操作 */
  function handleAdd() {
    reset();
    open.value = true;
    title.value = "添加考试";
  }

  /** 修改按钮操作 */
  function handleUpdate(row) {
    reset();
    const _id = row.id || ids.value
    getExam(_id).then(response => {
      form.value = response.data;
      open.value = true;
      title.value = "修改考试";
    });
  }

  /** 提交按钮 */
  function submitForm() {
    proxy.$refs["examRef"].validate(valid => {
      if (valid) {
        if (form.value.id != null) {
          updateExam(form.value).then(response => {
            proxy.$modal.msgSuccess("修改成功");
            open.value = false;
            getList();
          });
        } else {
          addExam(form.value).then(response => {
            proxy.$modal.msgSuccess("新增成功");
            open.value = false;
            getList();
          });
        }
      }
    });
  }

  /** 删除按钮操作 */
  function handleDelete(row) {
    const _ids = row.id || ids.value;
    proxy.$modal.confirm('删除后不可恢复，是否确认删除考试？').then(function() {
      return delExam(_ids);
    }).then(() => {
      getList();
      proxy.$modal.msgSuccess("删除成功");
    }).catch(() => {});
  }

  /** 导出按钮操作 */
  function handleExport() {
    proxy.download('dataControl/exam/export', {
      ...queryParams.value
    }, `exam_${new Date().getTime()}.xlsx`)
  }

</script>
