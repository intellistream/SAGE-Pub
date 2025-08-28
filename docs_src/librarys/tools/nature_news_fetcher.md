# SAGE 工具文档: `Nature_News_Fetcher_Tool`

!!! success "工具状态: 可用"
    **版本**: 1.0.0
    **描述**: 一个从《自然》（Nature）官网抓取最新新闻文章的工具。

---

## 1. 功能概述

`Nature_News_Fetcher_Tool` 是一个网页抓取工具，专门用于从 `nature.com` 的新闻板块获取最新的文章列表。它通过模拟浏览器请求、解析 HTML 页面来提取每篇文章的详细信息，包括标题、链接、描述、作者、发布日期和封面图片。

!!! note "礼貌抓取"
    该工具在每次页面请求后会暂停1秒，以避免对《自然》官网服务器造成过大负担。

---

## 2. 参数详解

该工具通过 `execute` 方法接收参数来执行新闻抓取任务。

### 输入参数

| 参数名 (Parameter) | 类型 (Type) | 描述 | 默认值 |
|:-------------------|:------------|:---------------------------------------------------|:---------|
| `num_articles` | `int` | 希望获取的文章总数。 | `100` |
| `max_pages` | `int` | 为了获取指定数量的文章，最多抓取的页面数。 | `5` |

### 输出格式

`execute` 方法返回一个 `list`，其中每个元素都是一个 `dict`，代表一篇文章。如果发生错误，则返回一个包含错误信息的列表。每个成功的文章字典包含以下键：

| 键 (Key) | 类型 (Type) | 描述 |
|:-----------|:----------------|:--------------------------------------|
| `title` | `str` | 文章的完整标题。 |
| `url` | `str` | 指向该文章的完整 URL。 |
| `description`| `str` | 文章的简短描述或摘要。 |
| `authors` | `list[str]` | 作者姓名列表。 |
| `date` | `str` | 文章的发布日期 (YYYY-MM-DD 格式)。 |
| `image_url` | `str` | 文章关联的封面图片 URL。 |

---

## 3. 使用示例

以下是如何调用 `Nature_News_Fetcher_Tool` 的示例。

=== "基础用法"
    抓取最新的 10 篇新闻文章，最多搜索 1 个页面。

    ```python title="基础用法示例"
    from your_module import Nature_News_Fetcher_Tool # 请替换为实际的模块路径

    # 1. 初始化工具
    tool = Nature_News_Fetcher_Tool()

    # 2. 执行抓取
    articles = tool.execute(num_articles=10, max_pages=1)

    # 3. 打印结果
    if articles and "error" not in articles[0]:
        print(f"成功获取 {len(articles)} 篇文章。")
        for article in articles:
            print(f"- {article['title']}")
    else:
        print(f"抓取失败: {articles}")
    ```

---

## 4. 内部实现逻辑

???+ info "执行流程详解 (点击展开)"
    `Nature_News_Fetcher_Tool` 的 `execute` 方法遵循以下步骤来完成任务：

    1.  **初始化**:
        * 创建一个空列表 `all_articles` 用于存储所有抓取到的文章。
        * 设置起始页码 `page_number = 1`。

    2.  **循环抓取**:
        * 进入一个 `while` 循环，条件是已抓取的文章数小于 `num_articles` 且当前页码不超过 `max_pages`。
        * **页面获取 (`fetch_page`)**:
            * 随机选择一个浏览器 `User-Agent` 来模拟真实用户。
            * 构造请求参数，包括排序方式 (`PubDate`) 和文章类型 (`news`)。
            * 使用 `requests` 库向 `https://www.nature.com/nature/articles` 发送 GET 请求。
        * **内容解析 (`parse_articles`)**:
            * 使用 `BeautifulSoup` 解析返回的 HTML 内容。
            * 定位到 ID 为 `new-article-list` 的 `<section>` 标签。
            * 遍历该区域内所有的 `<article>` 标签，并为每一篇文章提取标题、URL、描述、作者、日期和图片链接。
        * **结果处理**:
            * 如果当前页面没有抓取到任何文章，则认为已到达末页，中断循环。
            * 将当前页面抓取的文章列表 `page_articles` 添加到 `all_articles` 中。
            * 页码 `page_number` 加 1。
            * 调用 `time.sleep(1)` 等待 1 秒。

    3.  **异常处理**:
        * 整个过程被包裹在 `try...except` 块中。
        * 如果发生 `requests.exceptions.RequestException` (如网络问题、DNS错误)，则记录错误并返回包含网络错误信息的列表。
        * 如果发生任何其他未预料到的异常，则记录错误并返回包含通用错误信息的列表。

    4.  **返回结果**:
        * 循环结束后，根据用户请求的 `num_articles` 对 `all_articles` 列表进行切片，确保返回的文章数量不超过要求。

---

## 5. 依赖项与要求

* **Python 库**:
    - [x] `requests`: 用于发送 HTTP 请求。
    - [x] `beautifulsoup4`: 用于解析 HTML 内容。
    - [x] `os`: 用于文件路径操作（在 `if __name__ == "__main__"` 中使用）。
    - [x] `time`: 用于在请求之间实现延迟。
    - [x] `logging`: 用于记录程序运行信息和错误。
    - [x] `random`: 用于随机选择 User-Agent。
* **内部模块**:
    - [x] `sage.lib.tools.base.base_tool.BaseTool`: 工具的基类。

---

## 6. 限制与注意事项

!!! danger "重要限制"
    该工具的稳定运行依赖于《自然》官网的 HTML 结构。
    * **网站结构变更**: 如果 `nature.com` 的前端代码（如标签、类名、ID）发生变化，该工具的解析逻辑可能会失效，需要更新代码以适应新结构。
    * **网络依赖**: 工具的成功执行依赖于稳定的网络连接。
    * **反爬虫策略**: 尽管使用了随机 User-Agent，但如果目标网站部署了更复杂的反爬虫机制，抓取请求仍有可能被阻止。
