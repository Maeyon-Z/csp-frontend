import request from '@/utils/request'

// 查询试卷管理列表
export function listPaper(query) {
  return request({
    url: '/dataControl/paper/list',
    method: 'get',
    params: query
  })
}

// 查询试卷管理详细
export function getPaper(id) {
  return request({
    url: '/dataControl/paper/' + id,
    method: 'get'
  })
}

// 新增试卷管理
export function addPaper(data) {
  return request({
    url: '/dataControl/paper/add',
    method: 'post',
    data: data
  })
}

// 修改试卷管理
export function updatePaper(data) {
  return request({
    url: '/dataControl/paper/edit',
    method: 'put',
    data: data
  })
}

// 删除试卷管理
export function delPaper(id) {
  return request({
    url: '/dataControl/paper/del/' + id,
    method: 'delete'
  })
}

export function genExercise(params, type) {
  return request({
    url: '/dataControl/paper/genExercise/'+type,
    method: 'post',
    data: params
  })
}

export function getExerciseIds(type) {
  return request({
    url: '/dataControl/paper/getExerciseIds/'+type,
    method: 'post',
  })
}

export function savePaper(params) {
  return request({
    url: '/dataControl/paper/save',
    method: 'post',
    data: params
  })
}

export function getPaperExercise(paperId, type) {
  return request({
    url: '/dataControl/paper/getPaperExercise/' + paperId + "/" + type,
    method: 'get'
  })
}

export function getPaperListForExam() {
  return request({
    url: '/dataControl/paper/getPaperListForExam',
    method: 'get'
  })
}