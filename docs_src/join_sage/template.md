# MkDocs Material 高级表达方式模板

这个文件展示了在 MkDocs Material 主题中可以使用的各种高级表达方式和组件。

---

## 1. 告示框 (Admonitions)

!!! note "提示"
    这是一个提示框，用于展示重要信息。

!!! info "信息"
    这是一个信息框，用于展示一般信息。

!!! tip "小贴士"
    这是一个小贴士框，用于给出建议。

!!! warning "警告"
    这是一个警告框，用于提醒注意事项。

!!! danger "危险"
    这是一个危险框，用于标注风险操作。

!!! success "成功"
    这是一个成功框，用于标注成功状态。

!!! failure "失败"
    这是一个失败框，用于标注失败状态。

!!! bug "错误"
    这是一个错误框，用于标注 bug 或问题。

!!! example "示例"
    这是一个示例框，用于展示代码示例。

!!! quote "引用"
    这是一个引用框，用于引用他人观点。

### 可折叠的告示框

??? note "可折叠的提示 (点击展开)"
    这个告示框默认是折叠的，点击标题可以展开。

???+ warning "默认展开的可折叠告示框"
    这个告示框默认是展开的，但可以折叠。

---

## 2. 代码块增强

### 基本代码块
```python
def hello_world():
    print("Hello, World!")
```

### 带标题的代码块
```python title="示例代码"
def calculate_sum(a, b):
    return a + b

result = calculate_sum(5, 3)
print(f"结果是: {result}")
```

### 带行号的代码块
```python linenums="1"
class DataProcessor:
    def __init__(self, name):
        self.name = name
    
    def process(self, data):
        return f"处理 {data} 通过 {self.name}"
```

### 高亮特定行的代码块
```python linenums="1" hl_lines="2 3"
def important_function():
    # 这行会被高亮
    important_variable = "重要数据"
    return important_variable
```

### 内联代码块
这里有一些内联代码: `print("Hello")` 和 `var x = 10;`

---

## 3. 标签页 (Tabs)

=== "Python"
    ```python
    def greet(name):
        return f"Hello, {name}!"
    
    print(greet("SAGE"))
    ```

=== "JavaScript"
    ```javascript
    function greet(name) {
        return `Hello, ${name}!`;
    }
    
    console.log(greet("SAGE"));
    ```

=== "Java"
    ```java
    public class Greeting {
        public static String greet(String name) {
            return "Hello, " + name + "!";
        }
        
        public static void main(String[] args) {
            System.out.println(greet("SAGE"));
        }
    }
    ```

---

## 4. 表格

### 基本表格
| 特性 | 描述 | 状态 |
|------|------|------|
| 流处理 | 实时数据流处理 | ✅ 完成 |
| 批处理 | 批量数据处理 | ✅ 完成 |
| 分布式 | 分布式计算支持 | 🚧 开发中 |
| 监控 | 实时监控面板 | 📋 计划中 |

### 对齐表格
| 左对齐 | 居中对齐 | 右对齐 |
|:-------|:-------:|-------:|
| 内容1 | 内容2 | 内容3 |
| 较长的内容 | 中等内容 | 短内容 |

---

## 5. 列表增强

### 任务列表
- [x] 完成项目初始化
- [x] 实现基础功能
- [ ] 添加测试用例
- [ ] 完善文档
- [ ] 发布第一个版本

### 定义列表
数据流
:   一系列连续的数据元素序列

算子
:   对数据流进行转换的操作

批处理
:   一次性处理大量数据的计算模式

---

## 6. 数学公式 (需要额外配置)

内联公式: $E = mc^2$

块级公式:
$$
\sum_{i=1}^{n} x_i = x_1 + x_2 + \cdots + x_n
$$

---

## 7. 图标和表情符号

### 常用图标
:material-check: 完成  
:material-close: 取消  
:material-information: 信息  
:material-alert: 警告  
:material-lightbulb: 想法  
:material-rocket: 启动  
:material-cog: 设置  
:material-download: 下载  

### 表情符号
:smile: :heart: :star: :fire: :thumbsup: :rocket: :computer: :book:

---

## 8. 键盘按键

按 ++ctrl+c++ 复制文本  
按 ++ctrl+v++ 粘贴文本  
按 ++enter++ 确认  
按 ++shift+tab++ 反向缩进  

---

## 9. 脚注

这里是一个脚注的例子[^1]，还有另一个脚注[^2]。

[^1]: 这是第一个脚注的内容。
[^2]: 这是第二个脚注的内容，可以包含更多详细信息。

---

## 10. 缩写

SAGE 是一个很棒的项目，HTML 和 CSS 是网页开发的基础。

*[SAGE]: Stream Analytics and Graph Engine
*[HTML]: HyperText Markup Language
*[CSS]: Cascading Style Sheets

---

## 11. 链接和引用

### 外部链接
[访问 GitHub](https://github.com)

### 内部链接
<!-- [回到首页](index.md) -->
回到首页  
<!-- [查看 DataStream 介绍](api_guides/datastream/datastream_intro.md) -->
查看 DataStream 介绍

### 引用式链接
这是一个[引用式链接][ref1]，还有[另一个引用][ref2]。

[ref1]: https://example.com "示例网站"
[ref2]: https://docs.mkdocs.org "MkDocs 文档"

---

## 12. 图片

### 基本图片
![SAGE Logo](../assets/img/function.png)

### 带标题的图片
![数据流处理示意图](../assets/img/streaming.png "数据流处理流程")

### 可点击的图片
[![点击查看大图](../assets/img/transformation.png)](../assets/img/transformation.png)

---

## 13. 引用块

> 这是一个简单的引用块。

> 这是一个多行的引用块，
> 可以包含多行内容，
> 非常适合引用长文本。

> **重要引用**
> 
> 这个引用块包含了格式化的内容，
> 比如**粗体**和*斜体*文字。

---

## 14. 水平分割线

上面的内容

---

下面的内容

***

另一种分割线

---

## 15. 文本格式

**粗体文本**  
*斜体文本*  
***粗斜体文本***  
~~删除线文本~~  
==高亮文本==  
H~2~O (下标)  
X^2^ (上标)  

---

## 16. 进度条 (需要额外扩展)

进度条通常需要额外的扩展支持，可以用 HTML 实现：

<progress value="70" max="100">70%</progress>

---

## 17. 折叠内容块

<details>
<summary>点击展开详细信息</summary>

这里是折叠的内容，可以包含：

- 列表项
- **格式化文本**
- `代码块`

```python
def hidden_function():
    return "这是隐藏的代码"
```

</details>

---

## 18. HTML 标签增强

### 居中对齐
<center>这是居中的文字</center>

### 小字体
<small>这是小字体文本</small>

### 大字体
<big>这是大字体文本</big>

### 标记文本
<mark>这是标记的重要文本</mark>

---

## 19. 网格布局 (需要自定义 CSS)

<div class="grid" markdown>

<div class="grid-item" markdown>
**功能1**

这是第一个功能的描述
</div>

<div class="grid-item" markdown>
**功能2**

这是第二个功能的描述
</div>

</div>

---

## 20. 按钮样式 (需要自定义 CSS)

<button class="md-button">普通按钮</button>
<button class="md-button md-button--primary">主要按钮</button>

---

## 使用建议

1. **告示框**：最常用的高级组件，适合突出重要信息
2. **代码块增强**：对于技术文档特别重要
3. **标签页**：适合展示多种语言或方案的对比
4. **表格**：结构化数据展示
5. **任务列表**：项目进度跟踪
6. **图标**：增加视觉效果，但不要过度使用

---

## 21. 代码片段嵌入 (Snippets)

你可以使用 `pymdownx.snippets` 扩展来嵌入外部代码文件：

```python title="嵌入的代码示例"
--8<-- "hello_world.py"
```

也可以嵌入文件的特定行：

```python title="嵌入特定行"
--8<-- "hello_world.py:1:10"
```

---

## 22. 内联代码高亮 (Inline Highlight)

使用 `pymdownx.inlinehilite` 可以高亮内联代码：

这是普通内联代码 `print("hello")`，这是高亮内联代码 `#!python print("hello")`。

你也可以指定语言：`#!javascript console.log("hello")`

---

## 23. 属性列表 (Attr List)

使用 `attr_list` 扩展可以给元素添加属性：

### 图片属性
![示例图片](../assets/img/function.png){ width="300" }

### 链接属性
[这是一个在新窗口打开的链接](https://github.com){ target="_blank" }

### 文本属性
这是一段 *强调文字*{ .class-name #id-name } 带有自定义属性。

### 按钮样式链接
[下载 SAGE](https://github.com){ .md-button .md-button--primary }

---

## 24. HTML 标签在 Markdown 中 (MD in HTML)

使用 `md_in_html` 扩展可以在 HTML 标签中使用 Markdown：

<div class="highlight" markdown>

这个 div 中可以使用 **Markdown** 语法！

- 列表项 1
- 列表项 2

```python
print("代码块也可以使用")
```

</div>

---

## 25. 更多表情符号示例

### 技术相关
:fontawesome-brands-python: Python  
:fontawesome-brands-js-square: JavaScript  
:fontawesome-brands-git-alt: Git  
:fontawesome-brands-github: GitHub  
:fontawesome-brands-docker: Docker  

### 状态图标
:octicons-check-16: 完成  
:octicons-x-16: 失败  
:octicons-alert-16: 警告  
:octicons-info-16: 信息  
:octicons-question-16: 疑问  

### 自定义表情
:material-language-python: Python  
:material-language-javascript: JavaScript  
:material-database: 数据库  
:material-cloud: 云服务  
:material-api: API  

---

## 26. 更多文本格式化

### 智能符号
使用 `pymdownx.caret`、`pymdownx.mark`、`pymdownx.tilde`：

- ^^插入文本^^（上标文本）
- ~~删除文本~~（删除线）
- ==标记文本==（高亮标记）
- H~2~O（下标）
- E=mc^2^（上标）

### 组合使用
这是一个包含 ^^新增内容^^、~~删除内容~~ 和 ==重要标记== 的句子。

---

## 27. 数学公式支持 (需要 MathJax 或 KaTeX)

如果配置了数学公式支持，可以使用：

### 内联公式
当 $a \ne 0$ 时，方程 $ax^2 + bx + c = 0$ 的解为：

### 块级公式
$$x = \frac{-b \pm \sqrt{b^2-4ac}}{2a}$$

### 复杂公式
$$
\begin{align}
\dot{x} & = \sigma(y-x) \\
\dot{y} & = \rho x - y - xz \\
\dot{z} & = -\beta z + xy
\end{align}
$$

---

## 28. 更多键盘按键组合

### 常用快捷键
++ctrl+shift+p++ 打开命令面板  
++alt+tab++ 切换应用  
++win+r++ 运行对话框  
++f12++ 开发者工具  
++ctrl+shift+i++ 检查元素  

### Mac 快捷键
++cmd+c++ 复制  
++cmd+v++ 粘贴  
++cmd+shift+3++ 截屏  

---

## 29. 复杂的告示框嵌套

!!! note "主要说明"
    这是一个主要的说明框。

    !!! tip "嵌套提示"
        你可以在告示框中嵌套另一个告示框。

        ```python
        # 甚至可以包含代码
        def nested_example():
            return "嵌套示例"
        ```

    继续主要说明的内容...

---

## 30. 更复杂的表格

### 带有代码的表格
| 方法 | 语法 | 示例 |
|------|------|------|
| Map | `map(function)` | `stream.map(lambda x: x * 2)` |
| Filter | `filter(condition)` | `stream.filter(lambda x: x > 0)` |
| Reduce | `reduce(function)` | `stream.reduce(lambda a, b: a + b)` |

### 合并单元格表格 (需要额外插件)
| 类别 | 子类别 | 描述 |
|------|--------|------|
| 数据源 | 批处理 | 有限数据集 |
|        | 流处理 | 无限数据流 |
| 算子 | 转换 | map, filter, reduce |
|      | 动作 | collect, print, save |

---

## 扩展配置说明

你当前的配置已经包含了大部分扩展，非常完善！但还可以添加以下配置来支持数学公式：

```yaml
# 在 mkdocs.yml 中添加
extra_javascript:
    - theme/script.js
  - https://polyfill.io/v3/polyfill.min.js?features=es6
  - https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js

# 或者添加 KaTeX 支持
extra_css:
  - https://cdnjs.cloudflare.com/ajax/libs/KaTeX/0.16.7/katex.min.css
extra_javascript:
    - theme/script.js
  - https://cdnjs.cloudflare.com/ajax/libs/KaTeX/0.16.7/katex.min.js
  - https://cdnjs.cloudflare.com/ajax/libs/KaTeX/0.16.7/contrib/auto-render.min.js
```

## 总结

你的配置已经非常完善了！主要遗漏的功能包括：

1. **代码片段嵌入** - 可以直接嵌入外部文件
2. **内联代码高亮** - 更好的内联代码展示
3. **属性列表** - 给元素添加 CSS 类和属性
4. **HTML 中的 Markdown** - 在 HTML 标签中使用 Markdown
5. **更丰富的表情符号** - FontAwesome 和 Octicons 图标
6. **数学公式支持** - 需要额外的 JavaScript 库
