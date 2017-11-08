var zoom = require('node-zoom2');

class Book {
    constructor(BookID, Title, Author, Year, Url, Total) {
        this.RecordId = BookID;
        this.Title = Title;
        this.Author = Author;
        this.PublishYear = Year;
        this.BookUrl = Url;
        this.TotalResult = Total;
    }
}

function searchBook(server, queryText, index, count) {
    return new Promise((resolve, reject) => {
        let listRecords = [];
        zoom.connection(`${server['Url']}:${server['Port']}/${server['Database']}`)
        .set('preferredRecordSyntax', server['Syntax'])
        .query('prefix', queryText)
        .search(function(err, resultset) {
            if (err) return reject(err);
            if (resultset.size <= 0) return reject('no result');
            let total = resultset.size;
            resultset.getRecords(index, count, function(err, records) {
                if (err) return reject(err);
                while (records && records.hasNext()) {
                    var record = records.next();
                    let id = "", title = "", author = [], year = "", url = [];
                    try {
                        record.json['fields'].forEach(row => {
                            let oKey = Object.keys(row)[0];
                            switch(oKey) {
                                case "001": id = row[oKey]; break;
                                case "245":
                                case "246":
                                    title += (title == ""?"":"\n") + getMarcJsonValue(row[oKey]['subfields'], null); break;
                                case "100":
                                case "110":
                                    author.push(getMarcJsonValue(row[oKey]['subfields'], null)); break;
                                case "260": year = getMarcJsonValue(row[oKey]['subfields'], "c"); break;
                                case "856": url.push(getMarcJsonValue(row[oKey]['subfields'], "u")); break;
                            }
                        }, this);
                    
                        listRecords.push(new Book(id, title, author, year, url, total));
                    } catch (err1) {}
                }
                resolve(listRecords);
            })
        });
    });
}
function getMarcJsonValue(listObjects, subField) {
    let rowText = "";
    listObjects.forEach(item => {
        Object.keys(item).forEach(key => {
            if (!subField || key == subField)
                rowText += item[key];
        })
    });
    return rowText;
}
module.exports = searchBook;
//console.log(listRecords.length);

//const server={Url: '140.147.249.38', Port: '7090', Database: 'voyager', Syntax: 'USMARC'};
//searchBook(server, '@attr 1=4 "Technical"', 0, 10)
//.then(list => console.log(list))
//.catch(err => console.log(`${err}`));