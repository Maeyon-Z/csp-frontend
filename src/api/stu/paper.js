import request from '@/utils/request'


export function getPaperListForExam() {
  return request({
    url: '/stu/paper/getPaperListForExam',
    method: 'get'
  })
}

export function getPaperInfo(id) {
  return request({
    url: '/stu/paper/' + id,
    method: 'get'
  })
}

export function getPaperExercise(paperId, type) {
  return request({
    url: '/stu/paper/getPaperExercise/' + paperId + "/" + type,
    method: 'get'
  })
}