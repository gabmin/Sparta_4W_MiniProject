import { createAction, handleActions } from "redux-actions";
import { produce } from "immer";
import { apis } from "../../lib/axios";

import { actionCreators as editAction } from "./calendar";
import showError from "./error";

const SET_CONTENT = "SET_CONTENT";
const ADD_CONTENT = "ADD_CONTENT";
const DEL_CONTENT = "DEL_CONTENT";
const UDT_CONTENT = "UDT_CONTENT";
const EDIT_CONTENT = "EDIT_CONTENT";
const DEL_EDIT = "DEL_EDIT";

const setContent = createAction(SET_CONTENT, (post_list) => ({ post_list }));
const addContent = createAction(ADD_CONTENT, (post) => ({ post }));
const editContent = createAction(EDIT_CONTENT, (post) => ({ post }));
const delEdit = createAction(DEL_EDIT, (post) => ({ post }));
const udtContent = createAction(UDT_CONTENT, (post) => ({ post }));
const delContent = createAction(DEL_CONTENT, (id) => ({ id }));

const initialState = {
  list: [{}],
  editList: [],
  delCount: [],
};

const initialPost = {};

const setContentMW = (date) => {
  return function (dispatch, getState, { history }) {
    // console.log("나우데이트", date)
    apis
      .setContentAX({
        params: {
          date: date,
        },
      })
      .then((res) => {
        if (res.status >= 400) {
          showError(res.status, res.data.msg);
          history.push("/error");
          return;
        }
        const _post_list = res;
        console.log("리스폰스", _post_list);
        const post_list = res.data;
        console.log("리스폰스데이터", post_list);
        dispatch(setContent(post_list));
      })
      .catch((err) => {
        console.log("로드에러", err);
      });
  };
};

const addContentMW = (post) => {
  return function (dispatch, getState, { history }) {
    console.log("post넘겨받기", post);
    apis
      .addContentAX(post)
      .then((res) => {
        if (res.status >= 400) {
          showError(res.status, res.data.msg);
          history.push("/error");
          return;
        }
        dispatch(addContent(post));
        // console.log("[detail.js] addContentAX :::", res);
      })
      .catch((err) => {
        console.log("애드에러", err);
      });
  };
};

const udtContentMW = (id, post) => {
  return function (dispatch, getState, { history }) {
    console.log("수정데이터미들웨어에받기", id, post);
    apis
      .udtContentAX(id, post)
      .then((res) => {
        if (res.status >= 400) {
          showError(res.status, res.data.msg);
          history.push("/error");
          return;
        }
        console.log(post);
        dispatch(udtContent(id, post));
        dispatch(editAction.editCalendar(post));
      })
      .catch((err) => {
        console.log("업데이트에러", err);
      });
  };
};

const delContentMW = (id) => {
  return function (dispatch, { history }) {
    console.log("포스트아이디넘겨받기", id);
    apis
      .delContentAX({
        params: {
          id: id,
        },
      })
      .then((res) => {
        if (res.status >= 400) {
          showError(res.status, res.data.msg);
          history.push("/error");
          return;
        }
        console.log("알이에스", res);
        dispatch(delContent(id));
      })
      .catch((err) => {
        console.log("삭제에러", err);
      });
  };
};

export default handleActions(
  {
    [SET_CONTENT]: (state, action) =>
      produce(state, (draft) => {
        draft.list = action.payload.post_list;
      }),

    [ADD_CONTENT]: (state, action) =>
      produce(state, (draft) => {
        draft.list.push(action.payload.post);
      }),

    [EDIT_CONTENT]: (state, action) =>
      produce(state, (draft) => {
        draft.editList = action.payload.post;
        console.log("수정하기에디트리스트", draft.editList);
        console.log("수정하기넘겨받는포스트", action.payload.post);
      }),

    [DEL_EDIT]: (state, action) =>
      produce(state, (draft) => {
        draft.editList = [];
      }),

    [UDT_CONTENT]: (state, action) =>
      produce(state, (draft) => {
        let idx = draft.list.findIndex((p) => {
          console.log("업데이트 피아이디", p._id);
          console.log("업데이트 액션페이로드", action.payload);
          console.log("업데이트 액션페이로드아이디", action.payload._id);
          return p._id === action.payload._id;
        });
        draft.list[idx] = {
          ...draft.list[idx],
          ...action.payload.post,
        };
      }),

    [DEL_CONTENT]: (state, action) =>
      produce(state, (draft) => {
        let target_idx = draft.list.findIndex((p) => {
          console.log("삭제", p);
          console.log("삭제 액션페이로드", action.payload);
          console.log("삭제 액션페이로드아이디", action.payload.id);
          console.log("삭제 피 아이디", p._id);
          return p._id === action.payload.id;
        });

        if (target_idx !== -1) {
          console.log("삭제 타겟인덱스", target_idx);
          draft.list.splice(target_idx, 1);
          draft.delCount = Number(draft.delCount) + 1;
        }

        console.log(draft.delCount);
      }),
  },
  initialState
);

const actionCreators = {
  setContent,
  addContent,
  editContent,
  delEdit,
  addContentMW,
  setContentMW,
  udtContentMW,
  delContentMW,
};

export { actionCreators };
