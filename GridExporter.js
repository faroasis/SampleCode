var tableEl = $("#tableWrap"),
    staticHeadEl = tableEl.find(".static_thead_table"),
    staticBodyEl = tableEl.find(".static_tbody_table"),
    scrollHeadEl = tableEl.find(".scroll_thead_table"),
    scrollBodyEl = tableEl.find(".scroll_tbody_table");


/**
 * 提取表头
 * @param el
 */
function extractColumns(el) {
  var columns = [];
  // 排除掉checkbox列
  el.children("LI[class!=thCheckbox]").each(function () {
    var el = $(this);

    var cellEl = el.children("DIV.em");
    if (cellEl.length) {
      // 单层表头
      columns.push($.trim(cellEl.text()));
    }
    else {
      // 多层表头，标志为class=hebing
      cellEl = el.find("DIV.hebing");
      var parentCol = $.trim(cellEl.text()),
          subCellEls = el.find("DD DIV.em");
      subCellEls.each(function () {
        columns.push(parentCol + ":" + $.trim($(this).text()));
      });
    }
  });
  return columns;
}

/**
 * 提取表格内容
 * @param el
 */
function extractRows(el) {
  return el.find("TR").get().map(function (el) {
    // 排除掉checkbox列
    return $(el).children("TD[class!=tdCheckbox][class!=addList]").get().map(function (el) {
      return $.trim($(el).text());
    });
  });
}


/**
 * 将表头和表体组合成对象列表
 * @param columns
 * @param rows
 */
function buildDataGrid(columns, rows) {
  return rows.map(function (row) {
    var obj = {};
    columns.forEach(function (column, idx) {
      obj[column] = row[idx];
    });
    return obj;
  });
}

/**
 * 生成表格代码
 * @param columns
 * @param rows
 */
function getTableHtml(columns, rows) {
  var rootColMap = {},
      lvl1Cols = [],
      lvl2Cols = [];
  columns.forEach(function (col) {
    var psep = col.indexOf(":"),
        col1 = psep == -1 ? col : col.substr(0, psep),
        col2 = psep == -1 ? null : col.substr(psep + 1);
    if (col2) {
      if (!rootColMap[col1]) {
        lvl1Cols.push(col1);
        rootColMap[col1] = [];
      }
      rootColMap[col1].push(col2);
      lvl2Cols.push(col2);
    } else {
      lvl1Cols.push(col1);
    }
  });
  var html = [
    "<table border=1 cellpadding=0 cellspacing=0 style='border-collapse:collapse'>",
    "<thead>",
    // 一级表头
    "<tr>",
    lvl1Cols.map(function (c) {
      return [
        "<th", (lvl2Cols.length && !rootColMap[c] ? " rowspan='2'" : ""), " colspan='", (rootColMap[c] || [0]).length, "'>",
        c,
        "</th>"
      ].join("");
    }).join(""),
    "</tr>",
    // 二级表头
    (lvl2Cols.length ?
        ("<tr>" + lvl2Cols.map(function (c) {
          return "<th>" + c + "</th>";
        }).join("") + "</tr>") :
        ""),
    "</thead>",
    "<tbody>",
    rows.map(function (row) {
      return [
        "<tr>",
        columns.map(function (i, idx) {
          return "<td>" + row[idx] + "</td>";
        }).join(""),
        "</tr>"
      ].join("");
    }).join(""),
    "</tbody>",
    "</table>"
  ].join("");
  return html;
}

var columns = extractColumns(staticHeadEl).concat(extractColumns(scrollHeadEl)),
    rowsScroll = extractRows(scrollBodyEl),
    rowsStatic = extractRows(staticBodyEl),
    rows = rowsStatic.map(function (item, idx) {
      return item.concat(rowsScroll[idx]);
    });

console.info("columns", columns);
console.info("rows", rows);

var grid = buildDataGrid(columns, rows);
console.info("grid", grid);

var gridHtml = getTableHtml(columns, rows);
console.info(gridHtml);
window.open("about:blank").document.writeln(gridHtml);
