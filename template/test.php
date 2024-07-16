<?php require '../private/cache-control.php'; require '../private/headers.php'; ?>


<!-- <section class="box" data-handlers="beforeaddlistener{test2} afterwrite{test3}">~Demo afterwrite event</section> -->

<button data-handlers="click{test2}">Test 2 click</button>

<!--

Literals:
<ul>
  <li>
    Returned:
    <span data-merges="returned">
      Stuff inside a data-merges tag (unless it is a data-array) gets replaced by the data value
    </span>
  </li>
  <li>
    Method from current URL context:
    <span data-merges="methodCurrent">
      Method current
    </span>
  </li>
  <li>
    Breadcrumbs from current URL context:
    <span data-merges="breadcrumbsCurrent">
      Breadcrumbs current
    </span>
  </li>
  <li>
    This method = method args[0]:
    <span data-merges="methodNew">
      Method new
    </span>
  </li>
  <li>
    These breadcrumbs = currentTarget.dataset.breadcrumbs = args.join ('/')
    <span data-merges="breadcrumbsNew">
      Breadcrumbs new
    </span>
  </li>
</ul>

Willing victim (hierarchical object properties):
<p>
  <! data-merges="region.crime.victim.details.address.postcode" that is, unlimited depth (until you hit an array - see below) />
  name = <span data-merges="victim.name">Victim name - property of a parent property (unless inside an array)</span>,
  age = <span data-merges="victim.age">Victim age</span>
</p>
<p>

Breadcrumbs (array of literals):
  <span data-merges="breadcrumbs" data-array>
  <! data-merges="." to make the array element a string />
    <span data-index data-merges=".">Literal element in an array (row gets indexed)</span>
  </span>
</p>

Team (array of objects):
<ul data-merges="team" data-array>
  <! the data-array inner HTML is the template for the array loop />
  <li data-index>
    name = <span data-merges="name">Name (row gets indexed)</span>,
    age = <span data-merges="age">Age</span>
  </li>
</ul>

Not working yet: Consequences (arrays with hierarchical objects):
<ul data-merges="consequences" data-array>
  <li data-index>
    consequences[i].legal.penalty = <span data-merges="legal.penalty">Penalty (row gets indexed)</span>,
    consequences[i].legal.solicitor = <span data-merges="legal.solicitor">Solicitor</span>
  </li>
</ul>

-->


<!--

<pre>
// Merge strategy; this JS actually works:
var myData = {
    myOuter : {
        myArray : [
            {
                myInner : "foo bar"
            }
        ]
    }
}
var myVal = eval [ 'myData.' + 'myOuter.myArray[0].myInner' );
console.warn ('myVal = "'+myVal+'"');
// Outputs: myVal = "foo bar"

So we should work from the outer array and expand inner arrays as we loop.

</pre>

-->

<section>
  <p>
    Collection:
    <span class="main-class" data-merges=" text [ meta.collection ] classes [ meta.categories.join(' ') ] " data-ifempty="Untitled collection">Collection</span>
  </p>
  <p>
    Collection type:
    <span data-merges=" text [ meta.genre ] " data-ifempty=" ">Collection type</span>
  </p>
  <ul data-array="books">
    <li data-index data-merges=" data-isbn [ books[].isbn ] ">
      <h2 data-merges=" data-isbn [ books[].isbn) text [ books[].title ] " data-ifempty="Untitled book">Book title</h2>
      <section data-ifexists>
        <h3>Foreword</h3>
        <p data-merges=" html [ books[].content.foreword ] ">This is the foreword. Lorem ipsum sic dolor amet ...</p>
      </section>
      <h3>Chapters</h3>
      <ul data-array="books[].content.chapters">
        <li data-index>
          <h4 data-merges="text [ books[].title )">Chapter title</h4>
          <p data-merges="text [ books[].content.chapters[].meta.plot )">Chapter plot goes something like this. Lorem ipsum sic dolor amet ...</p>
          <ul data-array="books[].content.chapters[].paragraphs">
            <li data-index>
              <p data-merges="text [ books[].content.chapters[].paragraphs[] ] ">A paragraph goes something like this. Lorem ipsum sic dolor amet ...</p>
            </li>
            <li data-else>This chapter has no paragraphs</li>
          </ul>
        </li>
        <li data-else>This book has no chapters</li>
      </ul>
    </li>
    <li data-else>This collection has no books</li>
  </ul>
</section>


